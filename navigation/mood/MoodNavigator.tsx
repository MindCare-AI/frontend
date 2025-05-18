// navigation/MoodNavigator.tsx
"use client"
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"

// Screens
import FeedsScreen from "../../screens/moodTracker/FeedsScreen"
import NewEntryScreen from "../../screens/moodTracker/NewEntryScreen"
import EditEntryScreen from "../../screens/moodTracker/EditEntryScreen"
import DetailsScreen from "../../screens/moodTracker/DetailsScreen"
import AnalyticsScreen from "../../screens/moodTracker/AnalyticsScreen"
import SettingsScreen from "../../screens/moodTracker/SettingsScreen"

// Types
import type { MoodEntry } from "../../types/mood/mood"

export type RootStackParamList = {
  MainTabs: undefined
  NewEntry: undefined
  EditEntry: { entry: MoodEntry }
  Details: { entry: MoodEntry }
}

export type MainTabParamList = {
  Feeds: undefined
  Analytics: undefined
  Settings: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

// MoodTab Navigator (Bottom tabs)
function MainTabNavigator() {
  const theme = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: { paddingBottom: 5, height: 60 },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Feeds"
        component={FeedsScreen}
        options={{
          tabBarLabel: "Mood Feed",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: "Analytics",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-line" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

// Main MoodNavigator Stack
const MoodNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="NewEntry" component={NewEntryScreen} options={{ title: "New Mood Entry" }} />
      <Stack.Screen name="EditEntry" component={EditEntryScreen} options={{ title: "Edit Mood Entry" }} />
      <Stack.Screen name="Details" component={DetailsScreen} options={{ title: "Mood Details" }} />
    </Stack.Navigator>
  )
}

export default MoodNavigator