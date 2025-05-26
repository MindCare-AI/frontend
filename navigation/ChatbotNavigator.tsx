// navigation/ChatbotNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/global';
import { ChatbotStackParamList } from './types';

// Import chatbot screens
import ChatbotScreen from '../screens/ChatbotScreen/ChatbotScreen';
import ChatbotConversationListScreen from '../screens/ChatbotScreen/ChatbotConversationListScreen';
import ConversationSettingsScreen from '../screens/ChatbotScreen/ConversationSettingsScreen';

// Import chatbot context provider
import { ChatbotProvider } from '../contexts/chatbot/chatbotContext';

const Stack = createStackNavigator<ChatbotStackParamList>();

const ChatbotNavigator: React.FC = () => {
  return (
    <ChatbotProvider>
      <Stack.Navigator
        initialRouteName="ChatbotHome"
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
            ...globalStyles.h3,
            color: globalStyles.colors.white,
            fontWeight: '600',
          },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen 
          name="ChatbotHome" 
          component={ChatbotConversationListScreen}
          options={({ navigation }) => ({
            title: 'MindCare AI Assistant',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  // Navigate to drawer if needed or just use as a menu
                  console.log('Menu pressed');
                }}
                style={{ 
                  marginLeft: 16,
                  padding: 8,
                }}
              >
                <Ionicons 
                  name="menu" 
                  size={24} 
                  color={globalStyles.colors.white} 
                />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={{ 
                flexDirection: 'row', 
                marginRight: 16,
                gap: 12,
              }}>
                <TouchableOpacity
                  onPress={() => {
                    // Add conversation list functionality
                    console.log('Show conversation list');
                  }}
                  style={{ padding: 8 }}
                >
                  <Ionicons 
                    name="list" 
                    size={24} 
                    color={globalStyles.colors.white} 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    // Add new conversation functionality
                    console.log('Start new conversation');
                  }}
                  style={{ padding: 8 }}
                >
                  <Ionicons 
                    name="add" 
                    size={24} 
                    color={globalStyles.colors.white} 
                  />
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        
        <Stack.Screen 
          name="ChatbotConversation" 
          component={ChatbotScreen}
          options={({ route, navigation }) => ({
            title: 'Conversation',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  if (route.params?.conversationId) {
                    navigation.navigate('ConversationSettings', {
                      conversationId: route.params.conversationId
                    });
                  }
                }}
                style={{ 
                  marginRight: 16,
                  padding: 8,
                }}
              >
                <Ionicons 
                  name="settings-outline" 
                  size={24} 
                  color={globalStyles.colors.white} 
                />
              </TouchableOpacity>
            ),
          })}
        />
        
        <Stack.Screen 
          name="ConversationSettings" 
          component={ConversationSettingsScreen}
          options={{
            title: 'Conversation Settings',
          }}
        />
      </Stack.Navigator>
    </ChatbotProvider>
  );
};

export default ChatbotNavigator;