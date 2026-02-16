import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import CitySelectionScreen from '../screens/CitySelectionScreen';
import MainTabNavigator from './MainTabNavigator';
import { useApp } from '../context/AppContext';

export type OnboardingStackParamList = {
    Onboarding: undefined;
    CitySelection: { userName: string };
    MainApp: { city: string; district: string };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
    const { onboardingCompleted, location, isInitialized } = useApp();

    // Uygulama initialize olana kadar bekle
    if (!isInitialized) {
        return null;
    }

    // Onboarding tamamlanmış ve konum seçilmişse direkt ana uygulamayı göster
    if (onboardingCompleted && location) {
        console.log('✅ Onboarding tamamlanmış, ana uygulamaya yönlendiriliyor');
        return <MainTabNavigator />;
    }

    // Onboarding tamamlanmamışsa onboarding flow'unu göster
    console.log('ℹ️ Onboarding gösteriliyor');
    return (
        <Stack.Navigator
            initialRouteName="Onboarding"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
            />
            <Stack.Screen
                name="CitySelection"
                component={CitySelectionScreen}
            />
            <Stack.Screen
                name="MainApp"
                component={MainTabNavigator}
            />
        </Stack.Navigator>
    );
};

export default OnboardingNavigator;
