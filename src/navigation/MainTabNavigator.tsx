import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type MainTabParamList = {
    Home: { city: string; district: string };
    PrayerTimes: undefined;
    Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Geçici placeholder sayfalar
const PlaceholderScreen = ({ name }: { name: string }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{name} Yakında...</Text>
    </View>
);

const MainTabNavigator: React.FC<any> = ({ route }) => {
    // Onboarding'den gelen parametreleri Home sayfasına aktarmak için
    const { city, district } = route.params || { city: 'İstanbul', district: 'Kadıköy' };

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#1E3A5F',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                initialParams={{ city, district }}
                options={{
                    tabBarLabel: 'Ana Sayfa',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="PrayerTimes"
                component={PrayerTimesScreen}
                options={{
                    tabBarLabel: 'Vakitler',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📅</Text>,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Ayarlar',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        height: 70,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingBottom: 10,
        paddingTop: 10,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default MainTabNavigator;
