import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    documentId
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PrayerTimes, DayData, City, District, SelectedLocation } from '../types';

/**
 * Belirli bir tarih için namaz vakitlerini getirir
 * @param plateCode - İl plaka kodu (örn: "51" for Niğde)
 * @param districtKey - İlçe anahtarı (örn: "merkez")
 * @param date - Tarih (YYYY-MM-DD formatında)
 */
export async function getPrayerTimesForDate(
    plateCode: string,
    districtKey: string,
    date: string
): Promise<DayData | null> {
    if (!plateCode || !districtKey) return null;

    try {
        const cityDocRef = doc(db, 'cities', plateCode);
        const cityDocSnap = await getDoc(cityDocRef);

        if (cityDocSnap.exists()) {
            const cityData = cityDocSnap.data();

            // 1. Önce Map yapısında ara (Eski yapı için fallback)
            if (cityData && cityData.districts?.[districtKey]?.days?.[date]) {
                return cityData.districts[districtKey].days[date];
            }
        }

        // 2. District Sub-collection olarak ara
        const districtDocRef = doc(db, 'cities', plateCode, 'districts', districtKey);
        const districtDocSnap = await getDoc(districtDocRef);

        if (districtDocSnap.exists()) {
            const districtData = districtDocSnap.data();
            // District içinde days field'ı varsa
            if (districtData.days?.[date]) {
                return districtData.days[date];
            }
        }

        // 3. Days Sub-collection olarak ara (cities/51/districts/merkez/days/2026-02-01)
        const dayDocRef = doc(db, 'cities', plateCode, 'districts', districtKey, 'days', date);
        const dayDocSnap = await getDoc(dayDocRef);

        if (dayDocSnap.exists()) {
            const dayData = dayDocSnap.data();
            // Eğer doküman direkt DayData yapısındaysa (örn: { prayerTimes: {...}, date: "..." })
            // Veya doküman içinde bir field ise kontrol et. Genelde direkt data döner.
            return dayData as DayData;
        }

        return null;
    } catch (error) {
        console.error('getPrayerTimesForDate error:', error);
        throw error;
    }
}

/**
 * Bugünün namaz vakitlerini getirir
 */
export async function getTodayPrayerTimes(
    plateCode: string,
    districtKey: string
): Promise<DayData | null> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return getPrayerTimesForDate(plateCode, districtKey, today);
}

/**
 * Belirli bir tarih aralığı için namaz vakitlerini getirir
 * @param plateCode - İl plaka kodu
 * @param districtKey - İlçe anahtarı
 * @param startDate - Başlangıç tarihi (YYYY-MM-DD)
 * @param endDate - Bitiş tarihi (YYYY-MM-DD)
 */
export async function getPrayerTimesForDateRange(
    plateCode: string,
    districtKey: string,
    startDate: string,
    endDate: string
): Promise<DayData[]> {
    if (!plateCode || !districtKey) return [];

    try {
        const results: DayData[] = [];

        // 1. Önce eski Map yapısını kontrol et
        const cityDocRef = doc(db, 'cities', plateCode);
        const cityDocSnap = await getDoc(cityDocRef);

        if (cityDocSnap.exists()) {
            const cityData = cityDocSnap.data();
            if (cityData && cityData.districts?.[districtKey]?.days) {
                const days = cityData.districts[districtKey].days;
                Object.keys(days)
                    .filter(date => date >= startDate && date <= endDate)
                    .forEach(date => results.push(days[date]));

                if (results.length > 0) return results.sort((a, b) => a.date.localeCompare(b.date));
            }
        }

        // 2. District Sub-collection içindeki days field'ını kontrol et
        const districtDocRef = doc(db, 'cities', plateCode, 'districts', districtKey);
        const districtDocSnap = await getDoc(districtDocRef);

        if (districtDocSnap.exists()) {
            const districtData = districtDocSnap.data();
            if (districtData.days) {
                const days = districtData.days;
                Object.keys(days)
                    .filter(date => date >= startDate && date <= endDate)
                    .forEach(date => results.push(days[date]));

                if (results.length > 0) return results.sort((a, b) => a.date.localeCompare(b.date));
            }
        }

        // 3. Days Sub-collection sorgusu
        const daysCollectionRef = collection(db, 'cities', plateCode, 'districts', districtKey, 'days');

        // Tarih aralığına göre sorgula (Document ID tarih ise)
        const q = query(
            daysCollectionRef,
            where(documentId(), '>=', startDate),
            where(documentId(), '<=', endDate)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Data içinde date alanı yoksa ID'yi date olarak kullan
            const dayData = {
                ...data,
                date: data.date || doc.id
            } as DayData;
            results.push(dayData);
        });

        return results.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
        console.error('getPrayerTimesForDateRange error:', error);
        throw error;
    }
}

/**
 * Aylık namaz vakitlerini getirir
 * @param plateCode - İl plaka kodu
 * @param districtKey - İlçe anahtarı  
 * @param year - Yıl (örn: 2026)
 * @param month - Ay (1-12)
 */
export async function getMonthlyPrayerTimes(
    plateCode: string,
    districtKey: string,
    year: number,
    month: number
): Promise<DayData[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    return getPrayerTimesForDateRange(plateCode, districtKey, startDate, endDate);
}

/**
 * Tüm şehirleri getirir
 */
export async function getAllCities(): Promise<Array<{ plateCode: string; name: string }>> {
    try {
        const citiesRef = collection(db, 'cities');
        const snapshot = await getDocs(citiesRef);

        const cities: Array<{ plateCode: string; name: string }> = [];

        snapshot.forEach((doc) => {
            const data = doc.data() as City;
            cities.push({
                plateCode: doc.id,
                name: data.name
            });
        });

        // İsme göre sırala
        return cities.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    } catch (error) {
        console.error('getAllCities error:', error);
        throw error;
    }
}

/**
 * Belirli bir ilin ilçelerini getirir
 * @param plateCode - İl plaka kodu
 */
export async function getDistrictsForCity(
    plateCode: string
): Promise<Array<{ key: string; name: string }>> {
    try {
        const docRef = doc(db, 'cities', plateCode);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const cityData = docSnap.data();

            // 1. Önce document içindeki field'a bak (Map yapısı)
            if (cityData && cityData.districts) {
                const districts = Object.entries(cityData.districts).map(([key, district]: [string, any]) => ({
                    key,
                    name: district.name || key
                }));
                return districts.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
            }

            // 2. Field yoksa sub-collection'a bak
            const districtsRef = collection(db, 'cities', plateCode, 'districts');
            const districtsSnap = await getDocs(districtsRef);

            if (!districtsSnap.empty) {
                const districts: Array<{ key: string; name: string }> = [];
                districtsSnap.forEach((d) => {
                    const data = d.data();
                    districts.push({
                        key: d.id,
                        name: data.name || d.id
                    });
                });
                return districts.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
            }
        }

        return [];
    } catch (error) {
        console.error('getDistrictsForCity error:', error);
        throw error;
    }
}

/**
 * Şehir bilgisini getirir
 * @param plateCode - İl plaka kodu
 */
export async function getCityInfo(plateCode: string): Promise<{ name: string; plateCode: number } | null> {
    try {
        const docRef = doc(db, 'cities', plateCode);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const cityData = docSnap.data() as City;
            return {
                name: cityData.name,
                plateCode: cityData.plateCode
            };
        }

        return null;
    } catch (error) {
        console.error('getCityInfo error:', error);
        throw error;
    }
}
