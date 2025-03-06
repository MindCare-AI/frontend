import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppTabParamList } from '../types/navigation';
import FeedsScreen from '../screens/FeedsScreen/FeedsScreen';
import ChatbotScreen from '../screens/ChatbotScreen/ChatbotScreen';
import NotificationsScreen from '../screens/NotificationsScreen/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const Tab = createBottomTabNavigator<AppTabParamList>();

const AppNavigator = () => {
  return (
    <Tab.Navigator 
      initialRouteName="Feeds"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IoniconsName;
          switch (route.name) {
            case 'Feeds':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Chatbot':
              iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#002D62',
        tabBarInactiveTintColor: '#7A869A'
      })}
    >
      <Tab.Screen name="Feeds" component={FeedsScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
