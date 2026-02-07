import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <OnboardingNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

