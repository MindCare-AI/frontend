import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import InitialLoadingScreen from "../screens/InitialLoadingScreen";
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import ForgotPasswordScreen from "../screens/auth/ForgetPasswordScreen";
import SetNewPasswordScreen from "../screens/auth/SetNewPasswordScreen";

type RootStackParamList = {
  SetNewPassword: {
    uid: string;
    token: string;
  };
  Login: undefined;
  ForgotPassword: undefined;
  Signup: undefined;
  Welcome: undefined;
  InitialLoading: undefined;
  Splash: undefined;
  Onboarding: undefined;
};

// Create properly typed stack navigator
const Stack = createStackNavigator<RootStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="InitialLoading"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="InitialLoading" component={InitialLoadingScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;