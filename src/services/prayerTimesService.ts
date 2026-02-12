import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PrayerTimes, DayData, State, District, PrayerTimeDocument } from '../types';

/**
 * Belirli bir tarih için namaz vakitlerini getirir
 * @param districtId - İlçe ID (örn: "16704")
 * @param date - Tarih (YYYY-MM-DD formatında)
 */
export async function getPrayerTimesForDate(
    districtId: string,
    date: string
): Promise<DayData | null> {
    if (!districtId || !date) return null;

    try {
        const [year, month, day] = date.split('-');
        // Firebase'de aylar string olarak saklanıyor: "01", "02", vb.
        const monthKey = month; // Zaten "01", "02" formatında geliyor
        const dayKey = parseInt(day);

        // Döküman ID formatı: districtId_year (örn: "16704_2026")
        const docId = `${districtId}_${year}`;
        const docRef = doc(db, 'prayerTimes', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const prayerDoc = docSnap.data() as PrayerTimeDocument;
            
            const monthData = prayerDoc.months?.[monthKey];
            if (monthData && monthData[dayKey]) {
                const dayPrayer = monthData[dayKey];
                return {
                    date: date,
                    prayerTimes: {
                        imsak: dayPrayer.imsak,
                        gunes: dayPrayer.gunes,
                        ogle: dayPrayer.ogle,
                        ikindi: dayPrayer.ikindi,
                        aksam: dayPrayer.aksam,
                        yatsi: dayPrayer.yatsi
                    },
                    hijriDate: dayPrayer.hijri
                };
            }
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
    districtId: string
): Promise<DayData | null> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return getPrayerTimesForDate(districtId, today);
}

/**
 * Belirli bir tarih aralığı için namaz vakitlerini getirir
 * @param districtId - İlçe ID (örn: "16704")
 * @param startDate - Başlangıç tarihi (YYYY-MM-DD)
 * @param endDate - Bitiş tarihi (YYYY-MM-DD)
 */
export async function getPrayerTimesForDateRange(
    districtId: string,
    startDate: string,
    endDate: string
): Promise<DayData[]> {
    if (!districtId) return [];

    try {
        const results: DayData[] = [];
        
        const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
        const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

        // Her yıl için ayrı döküman çek (format: districtId_year, örn: "16704_2026")
        for (let year = startYear; year <= endYear; year++) {
            const docId = `${districtId}_${year}`;
            const docRef = doc(db, 'prayerTimes', docId);
            const docSnap = await getDoc(docRef);

            console.log(`Checking document: ${docId}, exists: ${docSnap.exists()}`);

            if (docSnap.exists()) {
                const prayerDoc = docSnap.data() as PrayerTimeDocument;
                console.log(`Document ${docId} data:`, {
                    districtId: prayerDoc.districtId,
                    districtName: prayerDoc.districtName,
                    availableMonths: Object.keys(prayerDoc.months || {})
                });
                
                const monthStart = (year === startYear) ? startMonth : 1;
                const monthEnd = (year === endYear) ? endMonth : 12;
                
                for (let month = monthStart; month <= monthEnd; month++) {
                    // Firebase'de aylar string olarak saklanıyor: "01", "02", vb.
                    const monthKey = String(month).padStart(2, '0');
                    const monthData = prayerDoc.months?.[monthKey];
                    if (!monthData) {
                        console.log(`Month ${monthKey} not found in document ${docId}. Available months:`, Object.keys(prayerDoc.months || {}));
                        continue;
                    }
                    
                    const dayStart = (year === startYear && month === startMonth) ? startDay : 1;
                    const dayEnd = (year === endYear && month === endMonth) ? endDay : 31;
                    
                    for (let day = dayStart; day <= dayEnd; day++) {
                        const dayPrayer = monthData[day];
                        if (dayPrayer) {
                            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            results.push({
                                date: dateStr,
                                prayerTimes: {
                                    imsak: dayPrayer.imsak,
                                    gunes: dayPrayer.gunes,
                                    ogle: dayPrayer.ogle,
                                    ikindi: dayPrayer.ikindi,
                                    aksam: dayPrayer.aksam,
                                    yatsi: dayPrayer.yatsi
                                },
                                hijriDate: dayPrayer.hijri
                            });
                        }
                    }
                }
            }
        }

        return results.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
        console.error('getPrayerTimesForDateRange error:', error);
        throw error;
    }
}

/**
 * Aylık namaz vakitlerini getirir
 * @param districtId - İlçe ID (örn: "16704")
 * @param year - Yıl (örn: 2026)
 * @param month - Ay (1-12)
 */
export async function getMonthlyPrayerTimes(
    districtId: string,
    year: number,
    month: number
): Promise<DayData[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    return getPrayerTimesForDateRange(districtId, startDate, endDate);
}

/**
 * Tüm illeri getirir (states collection)
 */
export async function getAllStates(): Promise<Array<{ id: string; name: string; countryId: number }>> {
    try {
        const statesRef = collection(db, 'states');
        const snapshot = await getDocs(statesRef);

        const states: Array<{ id: string; name: string; countryId: number }> = [];

        snapshot.forEach((doc) => {
            const data = doc.data() as State;
            states.push({
                id: doc.id,
                name: data.name,
                countryId: data.countryId
            });
        });

        // İsme göre sırala
        return states.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    } catch (error) {
        console.error('getAllStates error:', error);
        throw error;
    }
}

/**
 * Belirli bir ilin ilçelerini getirir (districts collection)
 * @param stateId - İl ID (örn: "500")
 */
export async function getDistrictsForState(
    stateId: string
): Promise<Array<{ id: string; name: string; stateId: string }>> {
    try {
        const districtsQuery = query(
            collection(db, 'districts'),
            where('stateId', '==', stateId)
        );
        
        const snapshot = await getDocs(districtsQuery);
        const districts: Array<{ id: string; name: string; stateId: string }> = [];

        snapshot.forEach((doc) => {
            const data = doc.data() as District;
            districts.push({
                id: doc.id,
                name: data.name,
                stateId: data.stateId
            });
        });

        // İsme göre sırala
        return districts.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    } catch (error) {
        console.error('getDistrictsForState error:', error);
        throw error;
    }
}

/**
 * İl bilgisini getirir (states collection)
 * @param stateId - İl ID (örn: "500")
 */
export async function getStateInfo(stateId: string): Promise<{ id: string; name: string; countryId: number } | null> {
    try {
        const docRef = doc(db, 'states', stateId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const stateData = docSnap.data() as State;
            return {
                id: stateId,
                name: stateData.name,
                countryId: stateData.countryId
            };
        }

        return null;
    } catch (error) {
        console.error('getStateInfo error:', error);
        throw error;
    }
}
