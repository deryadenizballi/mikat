import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomTabBar, { VakitIcon, HouseIcon, ProfileIcon } from '../components/CustomTabBar';

export type MainTabParamList = {
    Home: { city: string; district: string };
    PrayerTimes: undefined;
    Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC<any> = ({ route }) => {
    const { city, district } = route.params || { city: 'İstanbul', district: 'Kadıköy' };

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="PrayerTimes"
                component={PrayerTimesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <VakitIcon color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                initialParams={{ city, district }}
                options={{
                    tabBarIcon: ({ color, size }) => <HouseIcon color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <ProfileIcon color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;
