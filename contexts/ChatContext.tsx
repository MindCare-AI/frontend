import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../services/websocket';
import chatService from '../services/chatService';
import { Message, Conversation, ConnectionStatus } from '../types/chat';
import NetInfo from '@react-native-community/netinfo';

interface ChatContextType {
  messages: { [conversationId: string]: Message[] };
  conversations: { [id: string]: Conversation };
  connectionStatus: ConnectionStatus;
  sendMessage: (conversationId: string, content: string, type?: string, metadata?: any) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
  markAsRead: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [conversations, setConversations] = useState<{ [id: string]: Conversation }>({});
  
  // WebSocket setup
  const { sendMessage: wsSendMessage, connectionStatus } = useWebSocket('chat', handleWebSocketMessage);

  function handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'message':
        handleNewMessage(data.payload);
        break;
      case 'message_updated':
        handleMessageUpdate(data.payload);
        break;
      case 'message_deleted':
        handleMessageDelete(data.payload.messageId, data.payload.conversationId);
        break;
      case 'typing':
        handleTypingStatus(data.payload.conversationId, data.payload.userId, data.payload.isTyping);
        break;
      case 'read_receipt':
        handleReadReceipt(data.payload.messageId, data.payload.userId);
        break;
    }
  }

  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => ({
      ...prev,
      [message.conversationId]: [message, ...(prev[message.conversationId] || [])],
    }));

    setConversations(prev => {
      const conversation = prev[message.conversationId];
      if (!conversation) return prev;

      return {
        ...prev,
        [message.conversationId]: {
          ...conversation,
          lastMessage: message,
          updatedAt: message.timestamp,
        },
      };
    });
  }, []);

  const handleMessageUpdate = useCallback((message: Message) => {
    setMessages(prev => ({
      ...prev,
      [message.conversationId]: prev[message.conversationId]?.map(msg =>
        msg.id === message.id ? message : msg
      ) || [],
    }));
  }, []);

  const handleMessageDelete = useCallback((messageId: string, conversationId: string) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: prev[conversationId]?.filter(msg => msg.id !== messageId) || [],
    }));
  }, []);

  const handleTypingStatus = useCallback((conversationId: string, userId: string, isTyping: boolean) => {
    setConversations(prev => {
      const conversation = prev[conversationId];
      if (!conversation) return prev;

      return {
        ...prev,
        [conversationId]: {
          ...conversation,
          typingUsers: isTyping
            ? [...(conversation.typingUsers || []), userId]
            : conversation.typingUsers?.filter(id => id !== userId),
        },
      };
    });
  }, []);

  const handleReadReceipt = useCallback((messageId: string, userId: string) => {
    setMessages(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(conversationId => {
        updated[conversationId] = updated[conversationId].map(msg =>
          msg.id === messageId
            ? { ...msg, readBy: [...(msg.readBy || []), userId] }
            : msg
        );
      });
      return updated;
    });
  }, []);

  const sendMessage = useCallback(async (conversationId: string, content: string, type: string = 'text', metadata?: any) => {
    try {
      const message = await chatService.sendMessage({
        content,
        conversation_id: conversationId,
        message_type: type,
        metadata,
      });

      wsSendMessage({
        type: 'message',
        payload: message,
      });

      handleNewMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [wsSendMessage, handleNewMessage]);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const message = await chatService.editMessage(messageId, content);
      handleMessageUpdate(message);
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }, [handleMessageUpdate]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      // Note: The actual deletion will be handled by the WebSocket event
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }, []);

  const setTypingStatus = useCallback((conversationId: string, isTyping: boolean) => {
    wsSendMessage({
      type: 'typing',
      payload: {
        conversationId,
        isTyping,
      },
    });
  }, [wsSendMessage]);

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await chatService.markAsRead(conversationId);
      const lastMessage = messages[conversationId]?.[0];
      if (lastMessage) {
        wsSendMessage({
          type: 'read_receipt',
          payload: {
            messageId: lastMessage.id,
            conversationId,
          },
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }, [messages, wsSendMessage]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        conversations,
        connectionStatus,
        sendMessage,
        editMessage,
        deleteMessage,
        setTypingStatus,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;