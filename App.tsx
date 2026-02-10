import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';

import { AppProvider } from './src/context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <OnboardingNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AppProvider>
  );
}

