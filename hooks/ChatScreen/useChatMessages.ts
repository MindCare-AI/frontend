import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, PaginatedMessagesResponse, ConnectionStatus } from '../../types/chat';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../services/chatService';
import messageQueue from '../../services/messageQueue';
import { useWebSocket } from '../../services/websocket';
import { Platform } from 'react-native';

interface UseChatMessagesProps {
  conversationId: string;
  conversationType: 'one_to_one' | 'group' | 'chatbot';
}

interface MessagesState {
  items: Message[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  cursor: string | null;
}

const MESSAGES_PER_PAGE = 20;

export const useChatMessages = ({ conversationId, conversationType }: UseChatMessagesProps) => {
  const { accessToken, user } = useAuth();
  const [state, setState] = useState<MessagesState>({
    items: [],
    isLoading: true,
    error: null,
    hasMore: true,
    cursor: null,
  });
  const [optimisticUpdates, setOptimisticUpdates] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesCache = useRef<Map<string, Message>>(new Map());
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const isLoadingMoreRef = useRef(false);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // WebSocket connection for real-time updates
  const { connectionStatus, sendMessage } = useWebSocket(conversationId, handleWebSocketMessage);

  function handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'message_created':
        handleNewMessage(data.message);
        break;
      case 'message_updated':
        handleMessageUpdate(data.message);
        break;
      case 'message_deleted':
        handleMessageDelete(data.message_id);
        break;
      case 'typing_started':
        handleTypingStatus(data.user_id, true);
        break;
      case 'typing_stopped':
        handleTypingStatus(data.user_id, false);
        break;
    }
  }

  const handleTypingStatus = useCallback((userId: string, isTyping: boolean) => {
    if (userId === user?.id) return;

    setTypingUsers(prev => {
      const next = new Set(prev);
      if (isTyping) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });

    // Clear existing timeout if any
    if (typingTimeoutsRef.current.has(userId)) {
      clearTimeout(typingTimeoutsRef.current.get(userId));
    }

    // Set new timeout to clear typing status
    if (isTyping) {
      typingTimeoutsRef.current.set(
        userId,
        setTimeout(() => {
          setTypingUsers(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
          typingTimeoutsRef.current.delete(userId);
        }, 3000)
      );
    }
  }, [user?.id]);

  // Load initial messages and set up real-time updates
  useEffect(() => {
    loadMessages(true);
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
    };
  }, [conversationId]);

  // Handle message updates and optimistic UI updates
  const handleNewMessage = useCallback((message: Message) => {
    if (message.conversation_id !== conversationId) return;

    messagesCache.current.set(message.id, message);
    setState(prev => ({
      ...prev,
      items: [message, ...prev.items],
    }));
  }, [conversationId]);

  const handleMessageUpdate = useCallback((message: Message) => {
    if (message.conversation_id !== conversationId) return;

    messagesCache.current.set(message.id, message);
    setState(prev => ({
      ...prev,
      items: prev.items.map(msg => 
        msg.id === message.id ? message : msg
      ),
    }));
  }, [conversationId]);

  const handleMessageDelete = useCallback((messageId: string) => {
    messagesCache.current.delete(messageId);
    setState(prev => ({
      ...prev,
      items: prev.items.filter(msg => msg.id !== messageId),
    }));
  }, []);

  // Message loading and pagination
  const loadMessages = useCallback(async (refresh = false) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await chatService.fetchMessages(conversationId, refresh ? null : state.cursor);
      
      if (result) {
        setState(prev => ({
          items: refresh ? result.messages : [...prev.items, ...result.messages],
          isLoading: false,
          error: null,
          hasMore: result.hasMore,
          cursor: result.nextCursor,
        }));

        // Update cache
        result.messages.forEach(msg => {
          messagesCache.current.set(msg.id, msg);
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load messages',
      }));
    }
  }, [conversationId, state.cursor]);

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !state.hasMore || state.isLoading) return;

    isLoadingMoreRef.current = true;
    try {
      await loadMessages();
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [loadMessages, state.hasMore, state.isLoading]);

  // Message sending and status updates
  const sendMessage = useCallback(async (content: string, type: string = 'text', metadata?: any) => {
    if (!user) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      content,
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      timestamp: new Date().toISOString(),
      message_type: type,
      status: 'sending',
      metadata,
    };

    // Optimistic update
    setOptimisticUpdates(prev => [tempMessage, ...prev]);

    try {
      const sentMessage = await chatService.sendMessage({
        content,
        conversation_id: conversationId,
        message_type: type,
        metadata,
      });

      // Remove optimistic update and add real message
      setOptimisticUpdates(prev => prev.filter(msg => msg.id !== tempMessage.id));
      handleNewMessage(sentMessage);

      return sentMessage;
    } catch (error) {
      // Mark message as failed
      setOptimisticUpdates(prev =>
        prev.map(msg =>
          msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
        )
      );
      throw error;
    }
  }, [conversationId, user, handleNewMessage]);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const message = await chatService.editMessage(messageId, content);
      handleMessageUpdate(message);
      return message;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }, [handleMessageUpdate]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      handleMessageDelete(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }, [handleMessageDelete]);

  const retryFailedMessage = useCallback(async (messageId: string) => {
    const failedMessage = optimisticUpdates.find(msg => msg.id === messageId);
    if (!failedMessage) return;

    // Remove failed message from optimistic updates
    setOptimisticUpdates(prev => prev.filter(msg => msg.id !== messageId));

    // Retry sending
    try {
      await sendMessage(
        failedMessage.content,
        failedMessage.message_type,
        failedMessage.metadata
      );
    } catch (error) {
      console.error('Error retrying message:', error);
      throw error;
    }
  }, [optimisticUpdates, sendMessage]);

  // Combine optimistic updates with actual messages
  const messages = [...optimisticUpdates, ...state.items];

  // Update typing status
  const setTypingStatus = useCallback((isTyping: boolean) => {
    sendMessage({
      type: isTyping ? 'typing_started' : 'typing_stopped',
      payload: { conversation_id: conversationId }
    });
  }, [conversationId, sendMessage]);

  return {
    messages,
    isLoading: state.isLoading,
    error: state.error,
    hasMore: state.hasMore,
    loadMore,
    refresh: () => loadMessages(true),
    sendMessage,
    editMessage,
    deleteMessage,
    retryFailedMessage,
    typingUsers: Array.from(typingUsers),
    setTypingStatus,
    connectionStatus,
  };
};

export default useChatMessages;
