// filepath: /home/siaziz/Desktop/frontend/navigation/MessagingTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// Import the separate screens
import DirectMessagesScreen from '../screens/Messaging/DirectMessagesScreen';
import GroupMessagesScreen from '../screens/Messaging/GroupMessagesScreen';
import DirectChatScreen from '../screens/Messaging/DirectChatScreen';
import GroupChatScreen from '../screens/Messaging/GroupChatScreen';

// Import navigation types
export type MessagingTabParamList = {
  DirectMessagesTab: undefined;
  GroupMessagesTab: undefined;
};

export type DirectMessagesStackParamList = {
  DirectMessagesList: undefined;
  DirectChat: {
    conversationId: string;
    conversationTitle?: string;
    otherParticipantId?: number;
  };
  NewDirectConversation: undefined;
};

export type GroupMessagesStackParamList = {
  GroupMessagesList: undefined;
  GroupChat: {
    conversationId: string;
    conversationTitle?: string;
    groupName?: string;
  };
  NewGroupConversation: undefined;
  GroupDetails: {
    groupId: string;
  };
};

// Create stacks for each tab
const DirectStack = createStackNavigator<DirectMessagesStackParamList>();
const GroupStack = createStackNavigator<GroupMessagesStackParamList>();

// Direct Messages Stack Navigator
const DirectMessagesStackNavigator: React.FC = () => {
  return (
    <DirectStack.Navigator
      initialRouteName="DirectMessagesList"
      screenOptions={{
        headerShown: false
      }}
    >
      <DirectStack.Screen name="DirectMessagesList" component={DirectMessagesScreen} />
      <DirectStack.Screen name="DirectChat" component={DirectChatScreen} />
    </DirectStack.Navigator>
  );
};

// Group Messages Stack Navigator
const GroupMessagesStackNavigator: React.FC = () => {
  return (
    <GroupStack.Navigator
      initialRouteName="GroupMessagesList"
      screenOptions={{
        headerShown: false
      }}
    >
      <GroupStack.Screen name="GroupMessagesList" component={GroupMessagesScreen} />
      <GroupStack.Screen name="GroupChat" component={GroupChatScreen} />
    </GroupStack.Navigator>
  );
};

// Main Tab Navigator
const Tab = createBottomTabNavigator<MessagingTabParamList>();

const MessagingTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'DirectMessagesTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'GroupMessagesTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else {
            iconName = 'chatbubble-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="DirectMessagesTab"
        component={DirectMessagesStackNavigator}
        options={{
          title: 'Direct',
          tabBarLabel: 'Direct',
        }}
      />
      <Tab.Screen
        name="GroupMessagesTab"
        component={GroupMessagesStackNavigator}
        options={{
          title: 'Groups',
          tabBarLabel: 'Groups',
        }}
      />
    </Tab.Navigator>
  );
};

export default MessagingTabNavigator;
