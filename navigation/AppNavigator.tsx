import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FeedsScreen from '../screens/FeedsScreen/FeedsScreen';
import ChatbotScreen from '../screens/ChatbotScreen/ChatbotScreen';
import NotificationsScreen from '../screens/NotificationsScreen/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => (
  <Tab.Navigator initialRouteName="Feeds" screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Feeds" component={FeedsScreen} />
    <Tab.Screen name="Chatbot" component={ChatbotScreen} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export default AppNavigator;
