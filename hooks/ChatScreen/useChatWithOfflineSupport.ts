import { useEffect, useCallback, useState, useRef } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { Message, MessageRequest } from '../../types/chat';
import chatService from '../../services/chatService';
import { useMessageQueue } from './useMessageQueue';
import { useChat } from '../../contexts/ChatContext';

interface UseChatWithOfflineSupportOptions {
  conversationId: string;
  conversationType: 'one_to_one' | 'group' | 'chatbot';
  onError?: (error: Error) => void;
}

export const useChatWithOfflineSupport = ({
  conversationId,
  conversationType,
  onError,
}: UseChatWithOfflineSupportOptions) => {
  const netInfo = useNetInfo();
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { user } = useChat();

  // Initialize message queue for offline support
  const {
    queueMessage,
    retryMessage,
    queuedMessages,
    failedMessages,
    draft,
    updateDraft,
    clearDraft,
    isOffline,
  } = useMessageQueue({
    conversationId,
    onMessageSent: (message) => {
      // Handle successful message send
    },
    onMessageFailed: (messageId, error) => {
      onError?.(error);
    },
  });

  // Initialize chat service
  useEffect(() => {
    const initChat = async () => {
      try {
        await chatService.initialize(user?.accessToken || '');
        setIsInitialized(true);
      } catch (error) {
        onError?.(error as Error);
      }
    };

    if (user?.accessToken && !isInitialized) {
      initChat();
    }

    return () => {
      if (isInitialized) {
        chatService.disconnect();
      }
    };
  }, [user?.accessToken, isInitialized, onError]);

  // Handle real-time updates
  useEffect(() => {
    if (!isInitialized) return;

    const handleMessage = (message: Message) => {
      if (message.conversation_id === conversationId) {
        // Update message in context
      }
    };

    const handleTyping = ({ user_id, is_typing }: { user_id: string; is_typing: boolean }) => {
      if (is_typing) {
        setTypingUsers(prev => new Set(prev).add(user_id));
        
        // Clear previous timeout if exists
        const previousTimeout = typingTimeouts.current.get(user_id);
        if (previousTimeout) {
          clearTimeout(previousTimeout);
        }

        // Set new timeout
        const timeout = setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(user_id);
            return newSet;
          });
          typingTimeouts.current.delete(user_id);
        }, 3000);

        typingTimeouts.current.set(user_id, timeout);
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(user_id);
          return newSet;
        });
        
        const timeout = typingTimeouts.current.get(user_id);
        if (timeout) {
          clearTimeout(timeout);
          typingTimeouts.current.delete(user_id);
        }
      }
    };

    const handleConnectionChange = (status: 'connected' | 'disconnected' | 'reconnecting') => {
      setConnectionStatus(status);
    };

    chatService.setOptions({
      onMessageReceived: handleMessage,
      onTypingStatusChanged: handleTyping,
      onConnectionStatusChanged: handleConnectionChange,
      onError,
    });

    return () => {
      // Clear all typing timeouts
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
    };
  }, [isInitialized, conversationId, onError]);

  const sendMessage = useCallback(async (
    content: string,
    type: string = 'text',
    metadata?: any
  ): Promise<string> => {
    const messageRequest: MessageRequest = {
      content,
      conversation_id: conversationId,
      message_type: type,
      metadata,
    };

    try {
      if (netInfo.isConnected) {
        const message = await chatService.sendMessage(messageRequest);
        return message.id;
      } else {
        return await queueMessage(content, type, metadata);
      }
    } catch (error) {
      onError?.(error as Error);
      return await queueMessage(content, type, metadata);
    }
  }, [conversationId, netInfo.isConnected, queueMessage, onError]);

  const updateTypingStatus = useCallback((isTyping: boolean) => {
    if (!isInitialized || !netInfo.isConnected) return;

    chatService.sendTypingStatus(conversationId, isTyping);
  }, [isInitialized, netInfo.isConnected, conversationId]);

  const retryFailedMessage = useCallback((messageId: string) => {
    retryMessage(messageId);
  }, [retryMessage]);

  return {
    sendMessage,
    updateTypingStatus,
    retryFailedMessage,
    connectionStatus,
    typingUsers: Array.from(typingUsers),
    queuedMessages,
    failedMessages,
    draft,
    updateDraft,
    clearDraft,
    isOffline,
  };
};

export default useChatWithOfflineSupport;