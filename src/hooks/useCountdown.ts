import { useState, useEffect, useRef, useCallback } from 'react';
import { PrayerTimes, NextPrayerType, PRAYER_NAMES } from '../types';

interface CountdownResult {
    timeLeft: string;           // "04:20:15" formatında
    hours: number;
    minutes: number;
    seconds: number;
    nextPrayer: NextPrayerType;
    nextPrayerName: string;     // "İftar" veya "Sahur" veya vakit adı
    nextPrayerTime: string;     // "18:47" formatında
    isIftar: boolean;           // Sonraki vakit iftar mı?
    isSahur: boolean;           // Sonraki vakit sahur mı?
}

/**
 * Namaz vaktine geri sayım yapan hook
 * @param prayerTimes - Günün namaz vakitleri
 */
export function useCountdown(prayerTimes: PrayerTimes | null): CountdownResult {
    const [countdown, setCountdown] = useState<CountdownResult>({
        timeLeft: '--:--:--',
        hours: 0,
        minutes: 0,
        seconds: 0,
        nextPrayer: 'none',
        nextPrayerName: '',
        nextPrayerTime: '',
        isIftar: false,
        isSahur: false,
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const calculateCountdown = useCallback(() => {
        if (!prayerTimes) {
            return {
                timeLeft: '--:--:--',
                hours: 0,
                minutes: 0,
                seconds: 0,
                nextPrayer: 'none' as NextPrayerType,
                nextPrayerName: '',
                nextPrayerTime: '',
                isIftar: false,
                isSahur: false,
            };
        }

        const now = new Date();
        const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        // Vakitleri sırala
        const prayerOrder: Array<{ key: keyof PrayerTimes; time: string }> = [
            { key: 'imsak', time: prayerTimes.imsak },
            { key: 'gunes', time: prayerTimes.gunes },
            { key: 'ogle', time: prayerTimes.ogle },
            { key: 'ikindi', time: prayerTimes.ikindi },
            { key: 'aksam', time: prayerTimes.aksam },
            { key: 'yatsi', time: prayerTimes.yatsi },
        ];

        // Sonraki vakti bul
        let nextPrayer: keyof PrayerTimes | null = null;
        let nextPrayerTimeStr = '';
        let secondsUntilNext = 0;

        for (const prayer of prayerOrder) {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerSeconds = hours * 3600 + minutes * 60;

            if (prayerSeconds > currentTime) {
                nextPrayer = prayer.key;
                nextPrayerTimeStr = prayer.time;
                secondsUntilNext = prayerSeconds - currentTime;
                break;
            }
        }

        // Eğer bugün hiç vakit kalmadıysa, yarının imsakına say
        if (!nextPrayer) {
            const [hours, minutes] = prayerTimes.imsak.split(':').map(Number);
            const imsakSeconds = hours * 3600 + minutes * 60;
            secondsUntilNext = (24 * 3600 - currentTime) + imsakSeconds;
            nextPrayer = 'imsak';
            nextPrayerTimeStr = prayerTimes.imsak;
        }

        // Saat, dakika, saniye hesapla
        const hoursLeft = Math.floor(secondsUntilNext / 3600);
        const minutesLeft = Math.floor((secondsUntilNext % 3600) / 60);
        const secondsLeft = secondsUntilNext % 60;

        const timeLeft = `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

        // İftar = Akşam vakti, Sahur = İmsak vakti
        const isIftar = nextPrayer === 'aksam';
        const isSahur = nextPrayer === 'imsak';

        let nextPrayerName = PRAYER_NAMES[nextPrayer];
        if (isIftar) nextPrayerName = 'İftar';
        if (isSahur) nextPrayerName = 'Sahur';

        return {
            timeLeft,
            hours: hoursLeft,
            minutes: minutesLeft,
            seconds: secondsLeft,
            nextPrayer: nextPrayer as NextPrayerType,
            nextPrayerName,
            nextPrayerTime: nextPrayerTimeStr,
            isIftar,
            isSahur,
        };
    }, [prayerTimes]);

    useEffect(() => {
        // İlk hesaplama
        setCountdown(calculateCountdown());

        // Her saniye güncelle
        intervalRef.current = setInterval(() => {
            setCountdown(calculateCountdown());
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [calculateCountdown]);

    return countdown;
}

/**
 * Spesifik olarak iftara geri sayım
 */
export function useIftarCountdown(prayerTimes: PrayerTimes | null) {
    const countdown = useCountdown(prayerTimes);

    // Eğer şu an iftar geçtiyse bir sonraki güne kadar bekle
    if (!prayerTimes) {
        return {
            ...countdown,
            isPast: false,
        };
    }

    const now = new Date();
    const currentTime = now.getHours() * 3600 + now.getMinutes() * 60;
    const [hours, minutes] = prayerTimes.aksam.split(':').map(Number);
    const iftarSeconds = hours * 3600 + minutes * 60;

    return {
        ...countdown,
        isPast: currentTime > iftarSeconds,
    };
}
