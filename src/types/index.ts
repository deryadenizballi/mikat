// Firebase Veri Yapısı Tipleri

export interface PrayerTimes {
    imsak: string;
    gunes: string;
    ogle: string;
    ikindi: string;
    aksam: string;
    yatsi: string;
}

export interface DayData {
    date: string;
    prayerTimes: PrayerTimes;
    source?: string;
    hijriDate?: string;
}

// Yeni Firebase Yapısı - States Collection
export interface State {
    id: string;
    name: string;
    countryId: number;
}

// Yeni Firebase Yapısı - Districts Collection
export interface District {
    id: string;
    name: string;
    stateId: string;
}

// Yeni Firebase Yapısı - PrayerTimes Collection
export interface PrayerTimeDocument {
    districtId: string;
    districtName: string;
    months: {
        [monthKey: string]: {
            [dayKey: string]: {
                aksam: string;
                gunes: string;
                hijri: string;
                ikindi: string;
                imsak: string;
                ogle: string;
                yatsi: string;
            }
        }
    }
}

// Uygulama İçi Tipler

export interface SelectedLocation {
    cityPlateCode: string;
    cityName: string;
    districtKey: string;
    districtName: string;
}

export interface UserPreferences {
    userName: string;
    location: SelectedLocation | null;
    iftarNotification: boolean;
    sahurNotification: boolean;
}

// Namaz Vakti Adları (Türkçe mapping)
export const PRAYER_NAMES: Record<keyof PrayerTimes, string> = {
    imsak: 'İmsak',
    gunes: 'Güneş',
    ogle: 'Öğle',
    ikindi: 'İkindi',
    aksam: 'Akşam',
    yatsi: 'Yatsı',
};

// Sonraki vakit için enum
export type NextPrayerType = 'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi' | 'none';
