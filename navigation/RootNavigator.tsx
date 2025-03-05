import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/Splash/SplashScreen';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash" // Ensure Splash is the initial route
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="App" component={AppNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;