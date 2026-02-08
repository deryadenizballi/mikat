import { useState, useEffect, useCallback } from 'react';
import { DayData, PrayerTimes } from '../types';
import {
    getTodayPrayerTimes,
    getPrayerTimesForDate,
    getMonthlyPrayerTimes,
    getPrayerTimesForDateRange
} from '../services/prayerTimesService';

interface UsePrayerTimesResult {
    prayerTimes: PrayerTimes | null;
    dayData: DayData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Bugünün namaz vakitlerini getiren hook
 * @param plateCode - İl plaka kodu
 * @param districtKey - İlçe anahtarı
 */
export function useTodayPrayerTimes(
    plateCode: string | null,
    districtKey: string | null
): UsePrayerTimesResult {
    const [dayData, setDayData] = useState<DayData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!plateCode || !districtKey) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getTodayPrayerTimes(plateCode, districtKey);
            setDayData(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Bilinmeyen hata'));
        } finally {
            setLoading(false);
        }
    }, [plateCode, districtKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        prayerTimes: dayData?.prayerTimes || null,
        dayData,
        loading,
        error,
        refetch: fetchData,
    };
}

/**
 * Belirli bir tarih için namaz vakitlerini getiren hook
 */
export function usePrayerTimesForDate(
    plateCode: string | null,
    districtKey: string | null,
    date: string | null
): UsePrayerTimesResult {
    const [dayData, setDayData] = useState<DayData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!plateCode || !districtKey || !date) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getPrayerTimesForDate(plateCode, districtKey, date);
            setDayData(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Bilinmeyen hata'));
        } finally {
            setLoading(false);
        }
    }, [plateCode, districtKey, date]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        prayerTimes: dayData?.prayerTimes || null,
        dayData,
        loading,
        error,
        refetch: fetchData,
    };
}

interface UseMonthlyPrayerTimesResult {
    days: DayData[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Aylık namaz vakitlerini getiren hook
 */
export function useMonthlyPrayerTimes(
    plateCode: string | null,
    districtKey: string | null,
    year: number,
    month: number
): UseMonthlyPrayerTimesResult {
    const [days, setDays] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!plateCode || !districtKey) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getMonthlyPrayerTimes(plateCode, districtKey, year, month);
            setDays(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Bilinmeyen hata'));
        } finally {
            setLoading(false);
        }
    }, [plateCode, districtKey, year, month]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        days,
        loading,
        error,
        refetch: fetchData,
    };
}
