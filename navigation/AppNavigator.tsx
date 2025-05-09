//navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, Feather } from '@expo/vector-icons';
import MessagingNavigator from './MessagingNavigator';
import MoodNavigator from './MoodNavigator';
import { SettingsStack } from './SettingsStack';
import { AppStackParamList } from './types';
import { globalStyles } from '../styles/global';
import ChatbotScreen from '../screens/ChatbotScreen/ChatbotScreen';
import FeedsScreen from '../screens/FeedsScreen/FeedsScreen';
import AppointmentsNavigator from './AppointmentsNavigator'; // Updated import

const Tab = createBottomTabNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'alert'; // Default icon

          switch (route.name) {
            case 'Feeds':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Chatbot':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            case 'MoodTracker':
              return <Feather name="smile" size={size} color={color} />;
            default:
              iconName = 'alert';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: globalStyles.colors.primary,
        tabBarInactiveTintColor: globalStyles.colors.neutralMedium,
      })}
    >
      <Tab.Screen 
        name="Feeds" 
        component={FeedsScreen} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentsNavigator} // Use the updated navigator
        options={{ tabBarLabel: 'Appointments' }}
      />
      <Tab.Screen 
        name="Chatbot" 
        component={ChatbotScreen} 
        options={{ tabBarLabel: 'Chatbot' }}
      />
      <Tab.Screen
        name="MoodTracker"
        component={MoodNavigator}
        options={{ 
          tabBarLabel: 'Mood',
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={MessagingNavigator}
        options={{ 
          tabBarLabel: 'Messages',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack} 
        options={{ 
          tabBarLabel: 'Settings',
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
}