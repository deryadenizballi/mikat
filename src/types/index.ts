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

export interface District {
    name: string;
    days: Record<string, DayData>;
}

export interface City {
    name: string;
    plateCode: number;
    districts: Record<string, District>;
}

export interface CitiesData {
    cities: Record<string, City>;
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
