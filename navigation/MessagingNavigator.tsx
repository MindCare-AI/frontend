import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MessagingScreen from '../screens/MessagingScreen/MessagingScreen';
import ChatScreen from '../screens/ChatScreen/ChatScreen'; 

import { useAuth } from '../contexts/AuthContext';

export type MessagingStackParamList = {
  Messaging: undefined;
  Chat: {
    conversationId: number | string;
    conversationType: 'one_to_one' | 'group';
  };
};

const Stack = createStackNavigator<MessagingStackParamList>();

const MessagingNavigator = () => {
  const { user, accessToken } = useAuth();

  // Modified to only check for access token
  if (!accessToken) {
    return null; // Or return an authentication required screen
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Messaging"
        component={MessagingScreen}
        options={{ 
          headerTitle: 'Messages',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          headerTitle: 'Chat',
          headerTitleAlign: 'center',
        })}
      />
    </Stack.Navigator>
  );
};

export default MessagingNavigator;