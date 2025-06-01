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
import { getDirectMessages, sendDirectMessage } from '../../API/directMessages';

type RootStackParamList = {
  DirectChat: {
    conversationId: string | number;
    conversationTitle?: string;
    otherParticipantId?: number;
  };
};

type DirectChatScreenRouteProp = RouteProp<RootStackParamList, 'DirectChat'>;

const DirectChatScreen = () => {
  const route = useRoute<DirectChatScreenRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { conversationId, conversationTitle, otherParticipantId } = route.params;
  const connectionCheckerRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(websocketService.isConnected());
  const [messageText, setMessageText] = useState<string>('');
  const [isSomeoneTyping, setIsSomeoneTyping] = useState<boolean>(false);

  console.log(`[DirectChatScreen] Initializing chat for conversation: ${conversationId}`);
  console.log(`[DirectChatScreen] Current user:`, {
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
    markMessageAsRead,
    loadMoreMessages,
    hasMoreMessages,
    refreshMessages
  } = useMessages({
    conversationId,
    isGroup: false,
    getMessages: getDirectMessages,
    sendMessageApi: sendDirectMessage
  });

  // Helper function to connect to WebSocket
  const connectToWebSocket = useCallback(() => {
    if (!user || !conversationId) return;
    websocketService.connect({
      userId: user.id,
      username: user.username || '',
      conversationId: conversationId.toString(),
      conversationType: 'one-to-one'
    });
    // Subscribe to connection changes
    const unsubConn = websocketService.onConnectionChange((status) => {
      setIsConnected(status);
    });
    // Subscribe to incoming messages for typing and new messages
    const unsubMsg = websocketService.onMessage((data) => {
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
  }, [user, conversationId, refreshMessages]);

  // Initialize WebSocket connection and keep alive
  useEffect(() => {
    const cleanup = connectToWebSocket();
    connectionCheckerRef.current = setInterval(() => {
      if (!websocketService.isConnected()) connectToWebSocket();
    }, 5000);
    return cleanup;
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
        console.error('[DirectChatScreen] Error sending message:', error);
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
          title={conversationTitle || 'Chat'}
          onBack={() => navigation.goBack()}
          isGroup={false}
          isConnected={isConnected}
        />
        
        <MessagesList
          messages={messages}
          loading={loading}
          currentUserId={user?.id || ''}
          isTyping={isSomeoneTyping}
          onRetryMessage={markMessageAsRead}
          isGroup={false}
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

export default DirectChatScreen;
