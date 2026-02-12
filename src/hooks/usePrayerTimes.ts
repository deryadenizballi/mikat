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
 * @param districtId - İlçe ID (örn: "16704")
 */
export function useTodayPrayerTimes(
    districtId: string | null
): UsePrayerTimesResult {
    const [dayData, setDayData] = useState<DayData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!districtId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getTodayPrayerTimes(districtId);
            setDayData(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Bilinmeyen hata'));
        } finally {
            setLoading(false);
        }
    }, [districtId]);

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
 * @param districtId - İlçe ID (örn: "16704")
 * @param date - Tarih (YYYY-MM-DD formatında)
 */
export function usePrayerTimesForDate(
    districtId: string | null,
    date: string | null
): UsePrayerTimesResult {
    const [dayData, setDayData] = useState<DayData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!districtId || !date) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getPrayerTimesForDate(districtId, date);
            setDayData(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Bilinmeyen hata'));
        } finally {
            setLoading(false);
        }
    }, [districtId, date]);

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
 * @param districtId - İlçe ID (örn: "16704")
 * @param year - Yıl (örn: 2026)
 * @param month - Ay (1-12)
 */
export function useMonthlyPrayerTimes(
    districtId: string | null,
    year: number,
    month: number
): UseMonthlyPrayerTimesResult {
    const [days, setDays] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!districtId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getMonthlyPrayerTimes(districtId, year, month);
            setDays(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Bilinmeyen hata'));
        } finally {
            setLoading(false);
        }
    }, [districtId, year, month]);

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
