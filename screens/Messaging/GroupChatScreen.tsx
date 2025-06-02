import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../hooks/messagingScreen/useMessages';
import MessagesList from '../../components/Chat/MessagesList';
import ChatHeader from '../../components/Chat/ChatHeader';
import MessageInput from '../../components/Chat/MessageInput';
import websocketService from '../../services/websocketService';
import { getGroupMessages, sendGroupMessage } from '../../API/groupMessages';

type RootStackParamList = {
  GroupChat: {
    conversationId: string | number;
    conversationTitle?: string;
    groupName?: string;
  };
};

type GroupChatScreenRouteProp = RouteProp<RootStackParamList, 'GroupChat'>;

const GroupChatScreen = () => {
  const route = useRoute<GroupChatScreenRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { conversationId, conversationTitle, groupName } = route.params;
  const connectionCheckerRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(websocketService.isConnected());
  const [messageText, setMessageText] = useState<string>('');
  const [isSomeoneTyping, setIsSomeoneTyping] = useState<boolean>(false);

  console.log(`[GroupChatScreen] Initializing chat for group conversation: ${conversationId}`);
  console.log(`[GroupChatScreen] Current user:`, {
    id: user?.id,
    username: user?.username,
    type: typeof user?.id
  });

  const {
    messages,
    loading,
    isTyping,
    sendMessage,
    sendTyping,
    markMessageAsRead,
    loadMoreMessages,
    hasMoreMessages,
    refreshMessages
  } = useMessages({
    conversationId,
    isGroup: true,
    getMessages: async (id: string | number) => {
      const response = await getGroupMessages(id);
      // Type assertion to handle the response properly
      return { 
        messages: (response as any).results || (response as any).messages || [], 
        results: (response as any).results || [], 
        is_group: true 
      };
    },
    sendMessageApi: sendGroupMessage
  });

  // Reset circuit breaker on component mount and set up cleanup
  useEffect(() => {
    console.log('[GroupChatScreen] Resetting circuit breaker on mount');
    websocketService.resetCircuitBreaker();
    
    // Make sure to reset circuit breaker when component unmounts to avoid stale state
    return () => {
      websocketService.resetCircuitBreaker();
    };
  }, []);

  // Helper function to connect to WebSocket
  const connectToWebSocket = useCallback(() => {
    if (!user || !conversationId) return;
    
    try {
      // Always reset the circuit breaker before attempting connection
      websocketService.resetCircuitBreaker();
      
      // Connect with proper error handling
      websocketService.connect({
        userId: user.id,
        username: user.username || '',
        conversationId: conversationId.toString(),
        conversationType: 'group'
      }).catch(err => {
        console.log('[GroupChatScreen] WebSocket connection error:', err?.message || 'Unknown error');
      });
      
      // Subscribe to connection status
      const unsubConn = websocketService.onConnectionChange(status => setIsConnected(status));
      // Subscribe to messages for typing and new messages
      const unsubMsg = websocketService.onMessage(data => {
        if (data.event === 'typing.indicator') {
          setIsSomeoneTyping(Boolean(data.is_typing));
        } else if (data.event === 'chat.message') {
          refreshMessages();
        }
      });
      
      return () => {
        unsubConn(); unsubMsg();
        websocketService.disconnect();
        if (connectionCheckerRef.current) {
          clearInterval(connectionCheckerRef.current);
          connectionCheckerRef.current = null;
        }
      };
    } catch (error) {
      console.error('[GroupChatScreen] Error connecting to WebSocket:', error);
      return () => {};
    }
  }, [user, conversationId, refreshMessages]);

  // Initialize WebSocket connection and keep alive
  useEffect(() => {
    const cleanup = connectToWebSocket();
    
    // Set up connection checking interval
    connectionCheckerRef.current = setInterval(() => {
      if (!websocketService.isConnected()) {
        console.log('[GroupChatScreen] Connection checker detected disconnection');
        try {
          // Reset circuit breaker and attempt reconnection
          websocketService.resetCircuitBreaker();
          connectToWebSocket();
        } catch (error) {
          console.log('[GroupChatScreen] Reconnect error:', error);
          // Still reset the circuit breaker on error to allow future connection attempts
          websocketService.resetCircuitBreaker();
        }
      }
    }, 5000);
    
    // Proper cleanup when component unmounts
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
      if (connectionCheckerRef.current) {
        clearInterval(connectionCheckerRef.current);
        connectionCheckerRef.current = null;
      }
      // Also reset circuit breaker on unmount
      websocketService.resetCircuitBreaker();
    };
  }, [connectToWebSocket]);

  // Handle message sending
  const handleSendMessage = useCallback(() => {
    if (!messageText.trim()) return;
    sendMessage(messageText)
      .then(() => {
        setMessageText('');
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to send message. Please try again.');
        console.error('[GroupChatScreen] Error sending message:', error);
      });
  }, [sendMessage, messageText]);

  // Handle typing indicators
  const handleTyping = useCallback((isTyping: boolean) => {
    if (!user) return;
    
    sendTyping(isTyping);
  }, [sendTyping, user]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ChatHeader
          title={conversationTitle || groupName || 'Group Chat'}
          onBack={() => navigation.goBack()}
          isGroup={true}
          isConnected={isConnected}
        />
        
        <MessagesList
          messages={messages}
          loading={loading}
          currentUserId={user?.id || ''}
          isGroup={true}
        />
        
        <MessageInput
           value={messageText}
           onChangeText={text => {
             setMessageText(text);
             handleTyping(text.length > 0);
           }}
           onSend={handleSendMessage}
           disabled={!isConnected}
           placeholder="Type a message..."
         />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  keyboardView: {
    flex: 1
  }
});

export default GroupChatScreen;
