import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectedLocation, UserPreferences } from '../types';

const STORAGE_KEYS = {
    USER_NAME: '@mikat_user_name',
    SELECTED_LOCATION: '@mikat_selected_location',
    ALL_PRAYER_NOTIFICATION: '@mikat_all_prayer_notification',
    IFTAR_NOTIFICATION: '@mikat_iftar_notification',
    SAHUR_NOTIFICATION: '@mikat_sahur_notification',
    ONBOARDING_COMPLETED: '@mikat_onboarding_completed',
};

// ==================== Kullanıcı Adı ====================

export async function saveUserName(name: string): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
    } catch (error) {
        console.error('saveUserName error:', error);
        throw error;
    }
}

export async function getUserName(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
    } catch (error) {
        console.error('getUserName error:', error);
        return null;
    }
}

// ==================== Konum ====================

export async function saveSelectedLocation(location: SelectedLocation): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_LOCATION, JSON.stringify(location));
    } catch (error) {
        console.error('saveSelectedLocation error:', error);
        throw error;
    }
}

export async function getSelectedLocation(): Promise<SelectedLocation | null> {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_LOCATION);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error('getSelectedLocation error:', error);
        return null;
    }
}

// ==================== Bildirim Ayarları ====================

export async function saveIftarNotification(enabled: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.IFTAR_NOTIFICATION, JSON.stringify(enabled));
    } catch (error) {
        console.error('saveIftarNotification error:', error);
        throw error;
    }
}

export async function getIftarNotification(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.IFTAR_NOTIFICATION);
        return value ? JSON.parse(value) : true; // Varsayılan: açık
    } catch (error) {
        console.error('getIftarNotification error:', error);
        return true;
    }
}

export async function saveSahurNotification(enabled: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.SAHUR_NOTIFICATION, JSON.stringify(enabled));
    } catch (error) {
        console.error('saveSahurNotification error:', error);
        throw error;
    }
}

export async function getSahurNotification(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.SAHUR_NOTIFICATION);
        return value ? JSON.parse(value) : true; // Varsayılan: açık
    } catch (error) {
        console.error('getSahurNotification error:', error);
        return true;
    }
}

export async function saveAllPrayerNotification(enabled: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.ALL_PRAYER_NOTIFICATION, JSON.stringify(enabled));
    } catch (error) {
        console.error('saveAllPrayerNotification error:', error);
        throw error;
    }
}

export async function getAllPrayerNotification(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.ALL_PRAYER_NOTIFICATION);
        return value ? JSON.parse(value) : true; // Varsayılan: açık
    } catch (error) {
        console.error('getAllPrayerNotification error:', error);
        return true;
    }
}

// ==================== Onboarding ====================

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
    } catch (error) {
        console.error('setOnboardingCompleted error:', error);
        throw error;
    }
}

export async function isOnboardingCompleted(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        return value ? JSON.parse(value) : false;
    } catch (error) {
        console.error('isOnboardingCompleted error:', error);
        return false;
    }
}

// ==================== Tüm Tercihler ====================

export async function getAllPreferences(): Promise<UserPreferences> {
    const [userName, location, iftarNotification, sahurNotification] = await Promise.all([
        getUserName(),
        getSelectedLocation(),
        getIftarNotification(),
        getSahurNotification(),
    ]);

    return {
        userName: userName || '',
        location,
        iftarNotification,
        sahurNotification,
    };
}

export async function clearAllData(): Promise<void> {
    try {
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
        console.error('clearAllData error:', error);
        throw error;
    }
}
