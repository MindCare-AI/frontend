//navigation/MessagingNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MessagingScreen from '../screens/MessagingScreen/MessagingScreen';
import ChatScreen from '../screens/ChatScreen/ChatScreen';
import { useAuth } from '../contexts/AuthContext';

export type MessagingStackParamList = {
  Messaging: undefined;
  Chat: {
    conversationId: string; // Must be string (not number)
    conversationType: 'one_to_one' | 'group';
    title: string;
  };
};

const Stack = createStackNavigator<MessagingStackParamList>();

const MessagingNavigator = () => {
  const { accessToken } = useAuth();
  
  console.log('MessagingNavigator accessToken:', accessToken); // ✅ Debug

  if (!accessToken) {
    return null; 
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007BFF',
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        headerLeftContainerStyle: {
          paddingLeft: 10,
        },
        headerRightContainerStyle: {
          paddingRight: 10,
        },
        headerLeft: ({ canGoBack, onPress }) => 
          canGoBack ? (
            <TouchableOpacity 
              style={{ padding: 8 }} 
              onPress={onPress}
            >
              <Ionicons 
                name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} 
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          ) : null,
      }}
    >
      <Stack.Screen
        name="Messaging"
        component={MessagingScreen}
        options={{ 
          title: 'Messages',
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity 
              style={{ padding: 8 }}
              onPress={() => {
                console.log('Create new conversation');
                // TODO: Navigate to new conversation screen or show modal
              }}
            >
              <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({ 
          title: route.params.title,
          headerBackTitleVisible: false,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#007BFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
          },
          headerRight: () => (
            <TouchableOpacity 
              style={{ padding: 8 }}
              onPress={() => {
                console.log('Chat options for:', route.params.conversationId);
                // TODO: Show chat options menu or navigate to chat details
              }}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default MessagingNavigator;