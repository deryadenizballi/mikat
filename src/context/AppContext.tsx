import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PrayerTimes, DayData, SelectedLocation, UserPreferences } from '../types';
import {
    getSelectedLocation,
    saveSelectedLocation,
    getUserName,
    saveUserName,
    isOnboardingCompleted,
    setOnboardingCompleted as saveOnboardingCompleted,
    getAllPreferences,
    getCachedMonthlyPrayerTimes,
    saveCachedMonthlyPrayerTimes,
} from '../services/storageService';
import {
    schedulePrayerNotifications,
    requestNotificationPermissions,
} from '../services/notificationService';

interface AppContextType {
    // Kullanıcı Bilgileri
    userName: string;
    setUserName: (name: string) => Promise<void>;

    // Konum
    location: SelectedLocation | null;
    setLocation: (location: SelectedLocation) => Promise<void>;

    // Namaz Vakitleri
    todayPrayerTimes: PrayerTimes | null;
    todayData: DayData | null;
    prayerTimesLoading: boolean;
    prayerTimesError: Error | null;
    refreshPrayerTimes: () => Promise<void>;

    // Onboarding
    onboardingCompleted: boolean;
    completeOnboarding: () => Promise<void>;

    // Genel
    isInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    // State
    const [isInitialized, setIsInitialized] = useState(false);
    const [userName, setUserNameState] = useState('');
    const [location, setLocationState] = useState<SelectedLocation | null>(null);
    const [onboardingCompleted, setOnboardingCompletedState] = useState(false);

    // Prayer Times
    const [todayData, setTodayData] = useState<DayData | null>(null);
    const [prayerTimesLoading, setPrayerTimesLoading] = useState(false);
    const [prayerTimesError, setPrayerTimesError] = useState<Error | null>(null);

    // İlk yükleme - AsyncStorage'dan verileri al
    useEffect(() => {
        async function initialize() {
            try {
                const [savedLocation, savedName, completed] = await Promise.all([
                    getSelectedLocation(),
                    getUserName(),
                    isOnboardingCompleted(),
                ]);

                if (savedLocation) setLocationState(savedLocation);
                if (savedName) setUserNameState(savedName);
                setOnboardingCompletedState(completed);

                // Bildirim izinlerini iste
                await requestNotificationPermissions();

                // Background task'i kaydet (günlük bildirim planlaması için)
                const { registerBackgroundTask } = await import('../services/backgroundTaskService');
                await registerBackgroundTask();
                console.log('✅ Background task kaydedildi');
            } catch (error) {
                console.error('AppContext initialization error:', error);
            } finally {
                setIsInitialized(true);
            }
        }

        initialize();
    }, []);

    // Konum değiştiğinde namaz vakitlerini yeniden çek
    useEffect(() => {
        if (location) {
            refreshPrayerTimes();
        }
    }, [location]);

    // Kullanıcı adını kaydet
    const setUserName = async (name: string) => {
        await saveUserName(name);
        setUserNameState(name);
    };

    // Konumu kaydet
    const setLocation = async (newLocation: SelectedLocation) => {
        await saveSelectedLocation(newLocation);
        setLocationState(newLocation);
    };

    // Onboarding tamamla
    const completeOnboarding = async () => {
        await saveOnboardingCompleted(true);
        setOnboardingCompletedState(true);
    };


    // Namaz vakitlerini yenile
    const refreshPrayerTimes = async () => {
        if (!location || !location.districtKey) return;

        setPrayerTimesLoading(true);
        setPrayerTimesError(null);

        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1; // 1-indexed
            const today = now.toISOString().split('T')[0]; // "2026-02-16"

            // Önce aylık cache'i kontrol et
            console.log('🔍 Aylık cache kontrol ediliyor...');
            const cachedMonthlyData = await getCachedMonthlyPrayerTimes(
                location.districtKey,
                year,
                month
            );

            let monthlyData;

            if (cachedMonthlyData && cachedMonthlyData.length > 0) {
                // Aylık cache'den veri bulundu
                console.log('✅ Aylık cache\'den veri kullanılıyor');
                monthlyData = cachedMonthlyData;
            } else {
                // Cache yoksa Firebase'den aylık veriyi çek
                console.log('🌐 Firebase\'den aylık veri çekiliyor...');
                const { getMonthlyPrayerTimes } = await import('../services/prayerTimesService');
                monthlyData = await getMonthlyPrayerTimes(
                    location.districtKey,
                    year,
                    month
                );

                if (monthlyData && monthlyData.length > 0) {
                    // Başarılı veriyi cache'e kaydet
                    await saveCachedMonthlyPrayerTimes(monthlyData, location.districtKey, year, month);
                    console.log('✅ Aylık veri cache\'e kaydedildi');
                }
            }

            // Aylık veriden bugünün verisini bul
            if (monthlyData && monthlyData.length > 0) {
                const todayData = monthlyData.find((day: any) => day.date === today);

                if (todayData) {
                    setTodayData(todayData);
                    console.log('✅ Bugünün verisi bulundu:', today);

                    // Bugünün bildirimlerini zamanla (günlük strateji)
                    if (todayData?.prayerTimes) {
                        const { scheduleTodayNotifications } = await import('../services/notificationService');
                        await scheduleTodayNotifications(
                            todayData,
                            location.cityName,
                            location.districtName
                        );
                    }
                } else {
                    console.warn('⚠️ Bugünün verisi aylık cache\'de bulunamadı:', today);
                    setPrayerTimesError(new Error('Bugünün namaz vakitleri bulunamadı'));
                }
            } else {
                setPrayerTimesError(new Error('Namaz vakitleri yüklenemedi'));
            }
        } catch (error) {
            console.error('❌ Namaz vakitleri hatası:', error);
            setPrayerTimesError(error instanceof Error ? error : new Error('Bilinmeyen hata'));

            // Hata durumunda aylık cache'i tekrar dene (eski veri olsa bile göster)
            try {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;
                const today = now.toISOString().split('T')[0];

                const cachedMonthlyData = await getCachedMonthlyPrayerTimes(
                    location.districtKey,
                    year,
                    month
                );

                if (cachedMonthlyData && cachedMonthlyData.length > 0) {
                    const todayData = cachedMonthlyData.find((day: any) => day.date === today);
                    if (todayData) {
                        console.log('⚠️ Hata oldu ama eski aylık cache kullanılıyor');
                        setTodayData(todayData);
                        setPrayerTimesError(null); // Cache varsa hatayı temizle
                    }
                }
            } catch (cacheError) {
                console.error('Cache fallback hatası:', cacheError);
            }
        } finally {
            setPrayerTimesLoading(false);
        }
    };

    const value: AppContextType = {
        userName,
        setUserName,
        location,
        setLocation,
        todayPrayerTimes: todayData?.prayerTimes || null,
        todayData,
        prayerTimesLoading,
        prayerTimesError,
        refreshPrayerTimes,
        onboardingCompleted,
        completeOnboarding,
        isInitialized,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp(): AppContextType {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

export default AppContext;
