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
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../hooks/messagingScreen/useMessages';
import MessagesList from '../../components/Chat/MessagesList';
import ChatHeader from '../../components/Chat/ChatHeader';
import MessageInput from '../../components/Chat/MessageInput';
import websocketService from '../../services/websocketService';
import { sendMessage as apiSendMessage, getConversationById } from '../../API/conversations';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add debug flag
const DEBUG_WEBSOCKET = __DEV__ && false;

type RootStackParamList = {
  ChatScreen: {
    conversationId: string | number;
    conversationTitle?: string;
    isGroup?: boolean;
  };
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { conversationId, conversationTitle, isGroup = false } = route.params;
  const connectionCheckerRef = useRef<NodeJS.Timeout | null>(null);

  console.log(`[ChatScreen] Initializing chat for conversation: ${conversationId}`);
  console.log(`[ChatScreen] Current user:`, {
    id: user?.id,
    username: user?.username,
    type: typeof user?.id
  });

  const {
    messages,
    loading,
    error,
    isTyping,
    sendMessage,
    sendTyping,
    retryMessage,
    isConnected,
    retryConnection
  } = useMessages({
    conversationId,
    isGroup: isGroup || false,
    getMessages: async (id) => {
      // Simple implementation using the existing getConversationById function
      return getConversationById(id);
    },
    sendMessageApi: apiSendMessage
  });

  const [inputText, setInputText] = useState('');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [showConnectionRetry, setShowConnectionRetry] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Force WS connect on mount and ensure it stays connected
  useEffect(() => {
    console.log('[ChatScreen] 🔌 Forcing WS connect for convo:', conversationId);
    
    const initConnection = async () => {
      try {
        const conversationType = isGroup ? 'group' : 'one-to-one';
        
        // Store user info for reconnection
        await AsyncStorage.setItem('user', JSON.stringify({
          id: user?.id || '',
          username: user?.username || ''
        }));
        
        await websocketService.connect({
          userId: user?.id || '',
          username: user?.username || '',
          conversationId: conversationId.toString(),
          conversationType: conversationType
        });
        console.log('[ChatScreen] ✅ WS connect promise resolved');
        setConnectionAttempts(0);
        setShowConnectionRetry(false);
      } catch (err) {
        console.error('[ChatScreen] ❌ WS connect failed:', err);
        setConnectionAttempts(prev => prev + 1);
        
        // Show retry option after multiple failures
        if (connectionAttempts >= 3) {
          setShowConnectionRetry(true);
        }
      }
    };
    
    // Initial connection
    initConnection();
    
    // Start a periodic connection checker (less frequent to reduce noise)
    connectionCheckerRef.current = setInterval(() => {
      const isWsConnected = websocketService.isConnected();
      const currentConvoId = websocketService.getCurrentConversationId();
      
      if (DEBUG_WEBSOCKET) {
        console.log('[ChatScreen] 🔍 Checking WS connection:', {
          connected: isWsConnected,
          currentConvo: currentConvoId,
          targetConvo: conversationId.toString()
        });
      }
      
      // Only reconnect if we're not already connected to the right conversation
      // and we haven't exceeded reasonable retry attempts
      if ((!isWsConnected || currentConvoId !== conversationId.toString()) && 
          connectionAttempts < 5) {
        console.log('[ChatScreen] 🔄 Connection lost or wrong conversation, reconnecting...');
        initConnection();
      }
    }, 10000); // Check every 10 seconds instead of 5
    
    // Cleanup on unmount
    return () => {
      if (connectionCheckerRef.current) {
        clearInterval(connectionCheckerRef.current);
      }
      // Log the state for debugging
      console.log('[ChatScreen] 📋 Unmounting, WS stats:', websocketService.getConnectionStats());
    };
  }, [conversationId, user?.id, user?.username, connectionAttempts]);

  // Log connection‐state callbacks
  useEffect(() => {
    const unsub = websocketService.onConnectionChange((connected: boolean) => {
      console.log(`[ChatScreen] onConnectionChange →`, connected);
    });
    return unsub;
  }, []);

  // Handle typing indicator
  const handleTyping = useCallback((text: string) => {
    setInputText(text);
    
    if (text.length > 0 && !isUserTyping) {
      setIsUserTyping(true);
      sendTyping(true);
      console.log(`[ChatScreen] 🔤 Started typing indicator`);
    } else if (text.length === 0 && isUserTyping) {
      setIsUserTyping(false);
      sendTyping(false);
      console.log(`[ChatScreen] 🔤 Stopped typing indicator`);
    }
  }, [isUserTyping, sendTyping]);

  // Stop typing indicator after delay
  useEffect(() => {
    if (isUserTyping) {
      const timeout = setTimeout(() => {
        setIsUserTyping(false);
        sendTyping(false);
        console.log(`[ChatScreen] 🔤 Auto-stopped typing indicator`);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isUserTyping, sendTyping]);

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const messageContent = inputText.trim();
    console.log(`[ChatScreen] 📤 Sending message: "${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}"`);
    
    setInputText('');
    setIsUserTyping(false);
    sendTyping(false);

    try {
      // Check WebSocket before sending
      if (!isConnected) {
        console.log('[ChatScreen] 🔌 WS not connected, attempting reconnect before sending');
        try {
          const conversationType = isGroup ? 'group' : 'one-to-one';
          await websocketService.connect({
            userId: user?.id || '',
            username: user?.username || '',
            conversationId: conversationId.toString(),
            conversationType: conversationType
          });
          console.log('[ChatScreen] ✅ Reconnected WS before sending message');
        } catch (err) {
          console.log('[ChatScreen] ⚠️ Reconnection failed, will send via REST API');
        }
      }
      
      await sendMessage(messageContent);
      console.log(`[ChatScreen] ✅ Message sent successfully`);
    } catch (error) {
      console.error(`[ChatScreen] ❌ Failed to send message:`, error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  }, [inputText, sendMessage, sendTyping, isConnected, conversationId]);

  // Handle message retry
  const handleRetryMessage = useCallback(async (messageId: string | number) => {
    console.log(`[ChatScreen] 🔄 Retrying message: ${messageId}`);
    try {
      await retryMessage(messageId);
      console.log(`[ChatScreen] ✅ Message retry successful`);
    } catch (error) {
      console.error(`[ChatScreen] ❌ Message retry failed:`, error);
      Alert.alert('Error', 'Failed to retry message. Please try again.');
    }
  }, [retryMessage]);

  // Show connection status in header
  useEffect(() => {
    console.log(`[ChatScreen] 🔍 Connection status changed:`, {
      conversationId,
      isConnected,
      wsConnected: websocketService.isConnected(),
      wsConversationId: websocketService.getCurrentConversationId()
    });
    
    if (isConnected) {
      console.log(`[ChatScreen] ✅ WebSocket connected for conversation ${conversationId}`);
      setShowConnectionRetry(false);
      setConnectionAttempts(0);
    } else {
      console.log(`[ChatScreen] ❌ WebSocket disconnected for conversation ${conversationId}`);
      
      // Show retry option after a delay and multiple attempts
      const timeout = setTimeout(() => {
        if (!isConnected && connectionAttempts >= 2) {
          setShowConnectionRetry(true);
        }
      }, 10000); // Increased delay to 10 seconds
      
      return () => clearTimeout(timeout);
    }
  }, [isConnected, conversationId, connectionAttempts]);

  // Handle connection retry
  const handleRetryConnection = useCallback(async () => {
    console.log(`[ChatScreen] 🔄 User initiated connection retry`);
    setShowConnectionRetry(false);
    setConnectionAttempts(0);
    
    try {
      // Reset any circuit breakers
      websocketService.resetCircuitBreaker();
      
      await retryConnection();
      Alert.alert('Success', 'Reconnected to chat server');
    } catch (error) {
      console.error(`[ChatScreen] ❌ Manual retry failed:`, error);
      Alert.alert('Connection Failed', 'Unable to reconnect. Messages will be sent via backup method.');
      setShowConnectionRetry(true);
    }
  }, [retryConnection]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      <ChatHeader
        title={conversationTitle || `Chat ${conversationId}`}
        isGroup={isGroup}
        isConnected={isConnected}
        onBack={() => navigation.goBack()}
      />
      
      {/* Connection retry banner */}
      {showConnectionRetry && (
        <View style={styles.retryBanner}>
          <Text style={styles.retryText}>
            Connection issues detected. Messages will be sent via backup method.
          </Text>
          <TouchableOpacity onPress={handleRetryConnection} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <MessagesList
          messages={messages}
          currentUserId={user?.id || ''}
          loading={loading}
          onRetryMessage={handleRetryMessage}
          isTyping={isTyping}
          isGroup={isGroup}
        />
        
        <MessageInput
          value={inputText}
          onChangeText={handleTyping}
          onSend={handleSendMessage}
          disabled={loading}
          placeholder={isConnected ? "Type a message..." : "Type a message (using backup)..."}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  retryBanner: {
    backgroundColor: '#FFF3CD',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retryText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    marginRight: 10,
  },
  retryButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
});

export default ChatScreen;
