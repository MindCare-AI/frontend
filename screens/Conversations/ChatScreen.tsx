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
import { useMessages } from '../../hooks/useMessages';
import MessagesList from '../../components/Chat/MessagesList';
import ChatHeader from '../../components/Chat/ChatHeader';
import MessageInput from '../../components/Chat/MessageInput';
import websocketService from '../../services/websocketService';

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
  } = useMessages(conversationId);

  const [inputText, setInputText] = useState('');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [showConnectionRetry, setShowConnectionRetry] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Force WS connect on mount and ensure it stays connected
  useEffect(() => {
    console.log('[ChatScreen] 🔌 Forcing WS connect for convo:', conversationId);
    
    const initConnection = async () => {
      try {
        await websocketService.connect(conversationId.toString());
        console.log('[ChatScreen] ✅ WS connect promise resolved');
        setConnectionAttempts(0);
      } catch (err) {
        console.error('[ChatScreen] ❌ WS connect failed:', err);
        setConnectionAttempts(prev => prev + 1);
      }
    };
    
    // Initial connection
    initConnection();
    
    // Start a periodic connection checker
    connectionCheckerRef.current = setInterval(() => {
      const isWsConnected = websocketService.isConnected();
      const currentConvoId = websocketService.getCurrentConversationId();
      
      console.log('[ChatScreen] 🔍 Checking WS connection:', {
        connected: isWsConnected,
        currentConvo: currentConvoId,
        targetConvo: conversationId.toString()
      });
      
      if (!isWsConnected || currentConvoId !== conversationId.toString()) {
        console.log('[ChatScreen] 🔄 Connection lost or wrong conversation, reconnecting...');
        initConnection();
      }
    }, 5000);
    
    // Cleanup on unmount
    return () => {
      if (connectionCheckerRef.current) {
        clearInterval(connectionCheckerRef.current);
      }
      // Don't disconnect WebSocket on screen unmount - we're keeping connection alive
      // Just log the state for debugging
      console.log('[ChatScreen] 📋 Unmounting, WS stats:', websocketService.getConnectionStats());
    };
  }, [conversationId]);

  // Log connection‐state callbacks
  useEffect(() => {
    const unsub = websocketService.onConnectionChange(connected => {
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
          await websocketService.connect(conversationId.toString());
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
    } else {
      console.log(`[ChatScreen] ❌ WebSocket disconnected for conversation ${conversationId}`);
      
      // Show retry option after a delay if still not connected
      const timeout = setTimeout(() => {
        if (!isConnected) {
          setShowConnectionRetry(true);
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [isConnected, conversationId]);

  // Handle connection retry
  const handleRetryConnection = useCallback(async () => {
    console.log(`[ChatScreen] 🔄 User initiated connection retry`);
    setShowConnectionRetry(false);
    
    try {
      await retryConnection();
      Alert.alert('Success', 'Reconnected to chat server');
    } catch (error) {
      console.error(`[ChatScreen] ❌ Manual retry failed:`, error);
      Alert.alert('Connection Failed', 'Unable to reconnect. Messages will be sent via backup method.');
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
          <Text style={styles.retryText}>Connection lost. Messages will be sent via backup method.</Text>
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
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  retryBanner: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retryText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
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
