import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MessagingScreen from '../screens/MessagingScreen/MessagingScreen';
import ChatScreen from '../screens/ChatScreen/ChatScreen'; 
import { useAuth } from '../contexts/AuthContext';

// Update navigation params to include title
export type MessagingStackParamList = {
  Messaging: undefined;
  Chat: {
    conversationId: number | string;
    conversationType: 'one_to_one' | 'group';
    title?: string; // Title for header
    otherParticipantId?: number; // Optional user ID of the other participant (for 1-to-1)
  };
};

const Stack = createStackNavigator<MessagingStackParamList>();

const MessagingNavigator = () => {
  const { accessToken } = useAuth();

  // Modified to only check for access token
  if (!accessToken) {
    return null; // Or return an authentication required screen
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
        // Use a custom headerLeft to control the back button consistently
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
          // No back button needed, so override the headerLeft
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
        options={({ route, navigation }) => ({ 
          title: route.params.title || (
            route.params.conversationType === 'group' ? 'Group Chat' : 'Conversation'
          ),
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