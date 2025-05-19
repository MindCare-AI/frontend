// navigation/MoodNavigator.tsx
"use client"
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from "react-native-paper";

// Import only the MoodScreen
import MoodScreen from "../../screens/moodTracker/MoodScreen";
import { MoodLog } from "../../types/Mood";

// Define proper param lists
export type RootStackParamList = {
  MoodMain: undefined;
  MoodDetail: { moodLog?: MoodLog };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Main MoodNavigator - simplified to just use the MoodScreen with different names
const MoodNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MoodMain" 
        component={MoodScreen}
        options={{ 
          title: "Mood Tracker",
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTintColor: '#0d6efd',
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default MoodNavigator;