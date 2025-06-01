import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MessagingStackParamList } from './types';
import MessagingTabNavigator from './MessagingTabNavigator';
import DirectChatScreen from '../screens/Messaging/DirectChatScreen';
import GroupChatScreen from '../screens/Messaging/GroupChatScreen';
import MessagingSettingsScreen from '../screens/Messaging/MessagingSettingsScreen';
import { globalStyles } from '../styles/global';
import { createBoxShadow } from '../utils/shadows';

const Stack = createStackNavigator<MessagingStackParamList>();

const MessagingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MessagingTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: globalStyles.colors.primary,
          ...createBoxShadow(0, 2, 4, 'rgba(0, 0, 0, 0.1)', 2),
        },
        headerTintColor: globalStyles.colors.white,
        headerTitleStyle: {
          ...globalStyles.h3,
          color: globalStyles.colors.white,
        },
      }}
    >
      <Stack.Screen 
        name="MessagingTabs" 
        component={MessagingTabNavigator} 
        options={{ 
          title: 'Messages',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="DirectChat" 
        component={DirectChatScreen} 
        options={({ route }) => ({ 
          title: route.params?.conversationTitle || 'Chat',
          headerBackTitleVisible: false
        })} 
      />
      <Stack.Screen 
        name="GroupChat" 
        component={GroupChatScreen} 
        options={({ route }) => ({ 
          title: route.params?.conversationTitle || 'Group Chat',
          headerBackTitleVisible: false
        })} 
      />
      <Stack.Screen 
        name="MessagingSettings" 
        component={MessagingSettingsScreen as any}
        options={({ route }) => ({ 
          title: route.params?.conversationId ? 'Conversation Settings' : 'Messaging Settings',
          headerBackTitleVisible: false
        })} 
      />
    </Stack.Navigator>
  );
};

export default MessagingNavigator;
