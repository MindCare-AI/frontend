import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MessagingStackParamList } from './types';
import ConversationsScreen from '../screens/Conversations/ConversationsScreen';
import ChatScreen from '../screens/Conversations/ChatScreen';
import MessagingSettingsScreen from '../screens/Messaging/MessagingSettingsScreen';
import { globalStyles } from '../styles/global';
import { createBoxShadow } from '../utils/shadows';

const Stack = createStackNavigator<MessagingStackParamList>();

const MessagingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
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
        name="Home" 
        component={ConversationsScreen} 
        options={{ 
          title: 'Messages',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={({ route }) => ({ 
          title: 'Chat',
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
