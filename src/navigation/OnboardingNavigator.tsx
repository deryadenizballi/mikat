import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import CitySelectionScreen from '../screens/CitySelectionScreen';
import MainTabNavigator from './MainTabNavigator';

export type OnboardingStackParamList = {
    Onboarding: undefined;
    CitySelection: { userName: string };
    MainApp: { city: string; district: string };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
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
