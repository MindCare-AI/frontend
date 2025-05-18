import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessagingStackParamList } from './types';
import MessagingScreen from '../screens/MessagingScreen/MessagingScreen';
import ChatScreen from '../screens/MessagingScreen/ChatScreen';
import NewChatScreen from '../screens/MessagingScreen/NewChatScreen';
import { MessagingProvider } from '../contexts/MessagingContext';
import { globalStyles } from '../styles/global';

const Stack = createNativeStackNavigator<MessagingStackParamList>();

export default function MessagingNavigator() {
  return (
    <MessagingProvider>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: globalStyles.colors.backgroundLight,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            color: globalStyles.colors.textPrimary,
            fontSize: 18,
          },
          headerBackVisible: true,
        }}
      >
        <Stack.Screen
          name="Messaging"
          component={MessagingScreen}
          options={{
            title: 'Messages',
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ route }) => ({
            title: route.params.title,
            headerBackTitle: 'Back',
          })}
        />
        <Stack.Screen
          name="NewChat"  
          component={NewChatScreen}
          options={{
            title: 'New Chat',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </MessagingProvider>
  );
}