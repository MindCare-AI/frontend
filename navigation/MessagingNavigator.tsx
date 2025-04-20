//navigation/MessagingNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MessagingScreen from '../screens/MessagingScreen/MessagingScreen';
import ChatScreen from '../screens/ChatScreen/ChatScreen';
import { globalStyles } from '../styles/global';

export type MessagingStackParamList = {
  Messaging: undefined;
  Chat: {
    conversationId: string; // Must be string (not number)
    conversationType: 'one_to_one' | 'group';
    title: string;
  };
};

const Stack = createStackNavigator<MessagingStackParamList>();

const MessagingNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: globalStyles.colors.primary,
        shadowColor: globalStyles.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
      },
      headerTintColor: globalStyles.colors.white,
      headerTitleStyle: {
        ...globalStyles.bodyBold,
        fontSize: 18,
      },
      headerTitleAlign: 'center',
      headerLeftContainerStyle: {
        paddingLeft: globalStyles.spacing.sm,
      },
      headerRightContainerStyle: {
        paddingRight: globalStyles.spacing.sm,
      },
      headerLeft: ({ canGoBack, onPress }) =>
        canGoBack ? (
          <TouchableOpacity
            style={{ padding: globalStyles.spacing.xs }}
            onPress={onPress}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={globalStyles.colors.white}
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
              style={{ padding: globalStyles.spacing.xs }}
              onPress={() => {
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
          headerStyle: { backgroundColor: globalStyles.colors.primary },
          headerTintColor: globalStyles.colors.white,
          headerTitleStyle: {
            ...globalStyles.bodyBold,
            fontSize: 18,
          },
          headerRight: () => (
            <TouchableOpacity
              style={{ padding: globalStyles.spacing.xs }}
              onPress={() => {
                // TODO: Show chat options menu or navigate to chat details
              }}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={globalStyles.colors.white} />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );

export default MessagingNavigator;