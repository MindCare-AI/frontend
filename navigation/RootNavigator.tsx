//navigation/RootNavigator.tsx
import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from '../screens/Splash/SplashScreen';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

// Define types for RootStack
export type RootStackParamList = {
  Splash: undefined;
  Auth: { screen?: keyof import('./AuthNavigator').AuthStackParamList };
  App: { screen?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  // Force the app to always start with the splash screen in development
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Just to ensure we can see the log
    console.log("RootNavigator mounted");
  }, []);

  return (
    <NavigationContainer
      // Reset any stored navigation state to ensure fresh start
      initialState={undefined}
      onReady={() => console.log("Navigation container is ready")}
    >
      <Stack.Navigator 
        initialRouteName="Splash" 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ animationTypeForReplace: 'pop' }}
        />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="App" component={AppNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;