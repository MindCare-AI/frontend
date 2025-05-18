// navigation/MoodNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MoodTrackerParamList } from './types';

// Import mood tracker screens
import MoodTracker from '../screens/moodTracker/MoodTracker';
import LogMoodScreen from '../screens/moodTracker/LogMoodScreen';
import MoodHistoryScreen from '../screens/moodTracker/MoodHistoryScreen';
import MoodAnalyticsScreen from '../screens/moodTracker/MoodAnalyticsScreen';

const Stack = createStackNavigator<MoodTrackerParamList>();
const Tab = createBottomTabNavigator<MoodTrackerParamList>();

// MoodTab Navigator (Bottom tabs)
const MoodTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#002D62',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          backgroundColor: '#ffffff',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="MoodHome"
        component={MoodTracker}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MoodHistory"
        component={MoodHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MoodAnalytics"
        component={MoodAnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main MoodNavigator Stack
const MoodNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MoodTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MoodTabs" 
        component={MoodTabNavigator} 
      />
      <Stack.Screen 
        name="LogMood" 
        component={LogMoodScreen}
        options={{
          headerShown: true,
          headerTitle: 'Log Your Mood',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#333333',
        }}
      />
    </Stack.Navigator>
  );
};

export default MoodNavigator;