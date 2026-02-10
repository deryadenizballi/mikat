import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PrayerTimes, PRAYER_NAMES } from '../types';

// Bildirim handler ayarları (uygulama açıkken de bildirim göster)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Bildirim izinlerini iste
export async function requestNotificationPermissions(): Promise<boolean> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Bildirim izni verilmedi');
            return false;
        }

        // Android için bildirim kanalı oluştur
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('prayer-times', {
                name: 'Namaz Vakitleri',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#10B981',
                sound: 'default',
            });
        }

        return true;
    } catch (error) {
        console.error('Bildirim izni hatası:', error);
        return false;
    }
}

// Tüm zamanlanmış bildirimleri iptal et
export async function cancelAllScheduledNotifications(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Bildirim iptal hatası:', error);
    }
}

// Namaz vakitleri için bildirimleri zamanla
export async function schedulePrayerNotifications(
    prayerTimes: PrayerTimes,
    cityName: string,
    districtName: string
): Promise<void> {
    try {
        // Önce mevcut bildirimleri iptal et
        await cancelAllScheduledNotifications();

        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) return;

        // Kullanıcı tercihlerini al
        const [allEnabled, iftarEnabled, sahurEnabled] = await Promise.all([
            import('../services/storageService').then(m => m.getAllPrayerNotification()),
            import('../services/storageService').then(m => m.getIftarNotification()),
            import('../services/storageService').then(m => m.getSahurNotification()),
        ]);

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Her vakit için bildirim zamanla
        const prayerKeys: (keyof PrayerTimes)[] = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];

        for (const key of prayerKeys) {
            // Bildirim mantığı:
            // 1. 'Tüm Namaz Vakitleri' açıksa hepsi zamanlanır.
            // 2. Kapalıysa sadece özel olarak seçilen İftar (Akşam) ve Sahur (İmsak) zamanlanır.
            let shouldSchedule = false;

            if (allEnabled) {
                shouldSchedule = true;
            } else {
                if (key === 'aksam' && iftarEnabled) shouldSchedule = true;
                if (key === 'imsak' && sahurEnabled) shouldSchedule = true;
            }

            if (!shouldSchedule) continue;

            const timeStr = prayerTimes[key]; // "HH:MM" formatında
            const [hours, minutes] = timeStr.split(':').map(Number);

            // Bugünkü vakit zamanını oluştur
            const prayerDate = new Date(today);
            prayerDate.setHours(hours, minutes, 0, 0);

            // Eğer vakit geçmişse yarına zamanla
            if (prayerDate <= now) {
                prayerDate.setDate(prayerDate.getDate() + 1);
            }

            const prayerName = PRAYER_NAMES[key];
            const locationText = districtName ? `${districtName}, ${cityName}` : cityName;

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `🕌 ${prayerName} Vakti`,
                    body: `${locationText} için ${prayerName} vakti girdi. (${timeStr})`,
                    sound: 'default',
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                    ...(Platform.OS === 'android' && { channelId: 'prayer-times' }),
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: prayerDate,
                },
            });

            console.log(`📅 ${prayerName} bildirimi zamanlandı: ${prayerDate.toLocaleTimeString()}`);
        }

        console.log(`✅ Bildirimler güncellendi (İftar: ${iftarEnabled}, Sahur: ${sahurEnabled})`);
    } catch (error) {
        console.error('Bildirim zamanlama hatası:', error);
    }
}

// Zamanlanmış bildirimleri listele (debug için)
export async function listScheduledNotifications(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📋 Zamanlanmış ${scheduled.length} bildirim:`);
    scheduled.forEach((n, i) => {
        console.log(`  ${i + 1}. ${n.content.title} - ${JSON.stringify(n.trigger)}`);
    });
}
