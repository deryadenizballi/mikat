import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PrayerTimes, DayData, SelectedLocation, UserPreferences } from '../types';
import { getTodayPrayerTimes } from '../services/prayerTimesService';
import {
    getSelectedLocation,
    saveSelectedLocation,
    getUserName,
    saveUserName,
    isOnboardingCompleted,
    setOnboardingCompleted as saveOnboardingCompleted,
    getAllPreferences
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
        if (!location) return;

        setPrayerTimesLoading(true);
        setPrayerTimesError(null);

        try {
            const data = await getTodayPrayerTimes(
                location.cityPlateCode,
                location.districtKey
            );
            setTodayData(data);

            // Namaz vakitleri başarıyla çekildiğinde bildirimleri zamanla
            if (data?.prayerTimes) {
                await schedulePrayerNotifications(
                    data.prayerTimes,
                    location.cityName,
                    location.districtName
                );
            }
        } catch (error) {
            setPrayerTimesError(error instanceof Error ? error : new Error('Bilinmeyen hata'));
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
