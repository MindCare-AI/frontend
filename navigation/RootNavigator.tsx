//navigation/RootNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import SplashScreen from '../screens/Splash/SplashScreen';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import NotificationNavigator from './NotificationNavigator';
import ProfileScreen from '../screens/Settings/HomeSettingsScreen';
import MoodScreen from '../screens/Mood/MoodScreen';
import { JournalProvider } from '../contexts/Journal/JournalContext';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <JournalProvider>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="App" component={AppNavigator} />
        <Stack.Screen name="Mood" component={MoodScreen} />
        <Stack.Screen name="Notifications" component={NotificationNavigator} />
      </Stack.Navigator>
    </JournalProvider>
  );
}