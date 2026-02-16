import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getSelectedLocation } from './storageService';
import { getCachedMonthlyPrayerTimes, saveCachedMonthlyPrayerTimes } from './storageService';
import { getMonthlyPrayerTimes } from './prayerTimesService';
import { scheduleTodayNotifications } from './notificationService';
import { DayData } from '../types';

const BACKGROUND_FETCH_TASK = 'prayer-times-background-task';

/**
 * Background task tanımı
 * Her gece 01:00'da çalışır
 */
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        console.log('🌙 Background task başladı:', new Date().toISOString());

        // 1. Kullanıcı konumunu al
        const location = await getSelectedLocation();
        if (!location) {
            console.log('⚠️ Konum bulunamadı, task atlanıyor');
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // 2. Bugünün tarihini al
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 0-indexed
        const day = now.getDate();
        const todayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        console.log('📅 Bugün:', todayKey);
        console.log('📍 Konum:', location.districtName);

        // 3. Cache'de bu ayın verisi var mı kontrol et
        let monthlyData = await getCachedMonthlyPrayerTimes(
            location.districtKey,
            year,
            month
        );

        // 4. Cache'de veri yoksa Firebase'den çek
        if (!monthlyData || monthlyData.length === 0) {
            console.log('🔄 Cache\'de veri yok, Firebase\'den çekiliyor...');
            try {
                monthlyData = await getMonthlyPrayerTimes(
                    location.districtKey,
                    year,
                    month
                );

                // Cache'e kaydet
                if (monthlyData && monthlyData.length > 0) {
                    await saveCachedMonthlyPrayerTimes(
                        monthlyData,
                        location.districtKey,
                        year,
                        month
                    );
                    console.log('✅ Veri Firebase\'den çekildi ve cache\'lendi');
                }
            } catch (error) {
                console.error('❌ Firebase\'den veri çekilemedi:', error);
                return BackgroundFetch.BackgroundFetchResult.Failed;
            }
        } else {
            console.log('✅ Cache\'den veri kullanılıyor');
        }

        // 5. Bugünün verisini bul
        const todayData = monthlyData?.find((day: DayData) => day.date === todayKey);

        if (!todayData) {
            console.log('⚠️ Bugünün verisi bulunamadı');
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // 6. Bugünün bildirimlerini planla (kullanıcı tercihlerine göre)
        await scheduleTodayNotifications(
            todayData,
            location.cityName,
            location.districtName
        );

        console.log('✅ Background task tamamlandı');
        return BackgroundFetch.BackgroundFetchResult.NewData;

    } catch (error) {
        console.error('❌ Background task hatası:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

/**
 * Background task'i kaydet
 * Uygulama başladığında çağrılmalı
 */
export async function registerBackgroundTask(): Promise<void> {
    try {
        // Önce task'in zaten kayıtlı olup olmadığını kontrol et
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);

        if (isRegistered) {
            console.log('ℹ️ Background task zaten kayıtlı');
            return;
        }

        // Task'i kaydet
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
            minimumInterval: 60 * 60 * 24, // 24 saat (saniye cinsinden)
            stopOnTerminate: false, // Uygulama kapansa bile çalış
            startOnBoot: true, // Cihaz yeniden başladığında başlat
        });

        console.log('✅ Background task kaydedildi');
    } catch (error) {
        console.error('❌ Background task kaydedilemedi:', error);
    }
}

/**
 * Background task'i kaldır
 * Gerekirse kullanılabilir
 */
export async function unregisterBackgroundTask(): Promise<void> {
    try {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
        console.log('🗑️ Background task kaldırıldı');
    } catch (error) {
        console.error('❌ Background task kaldırılamadı:', error);
    }
}

/**
 * Background task durumunu kontrol et
 */
export async function getBackgroundTaskStatus(): Promise<BackgroundFetch.BackgroundFetchStatus | null> {
    try {
        return await BackgroundFetch.getStatusAsync();
    } catch (error) {
        console.error('❌ Background task durumu alınamadı:', error);
        return null;
    }
}
