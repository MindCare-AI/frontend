//navigation/AuthNavigator.tsx
import React from 'react';import { globalStyles } from '../styles/global';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgetPasswordScreen';
import SetNewPasswordScreen from '../screens/auth/SetNewPasswordScreen';
import ProfileScreen from '../screens/Settings/HomeSettingsScreen';
import JournalScreen from '../screens/JournalScreen/JournalScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: globalStyles.colors.white },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen} 
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ title: 'Reset Password' }} 
      />
      <Stack.Screen 
        name="SetNewPassword" 
        component={SetNewPasswordScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;