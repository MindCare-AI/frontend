import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { Message, Conversation, TypingIndicator } from '../types/messaging';
import messagingService from '../services/messagingService';

interface MessagingState {
  conversations: Conversation[];
  activeConversation: { id: string; name: string } | null;
  messages: { [conversationId: string]: Message[] };
  typingIndicators: TypingIndicator[];
  isConnected: boolean;
  error: string | null;
  loadingMessages: boolean;
  hasMoreMessages: boolean;
}

type MessagingAction =
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: { id: string; name: string } | null }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'SET_MESSAGES'; payload: { conversationId: string; messages: Message[] } }
  | { type: 'SET_TYPING'; payload: TypingIndicator }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_PRESENCE'; payload: any }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING_MESSAGES'; payload: boolean }
  | { type: 'SET_HAS_MORE_MESSAGES'; payload: boolean };

interface MessagingContextValue {
  state: MessagingState;
  sendMessage: (content: string, attachment?: File) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  loadMoreMessages: () => Promise<void>;
  setActiveConversation: (conversation: { id: string; name: string } | null) => Promise<void>;
}

const initialState: MessagingState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  typingIndicators: [],
  isConnected: false,
  error: null,
  loadingMessages: false,
  hasMoreMessages: true,
};

const MessagingContext = createContext<MessagingContextValue | null>(null);

function messagingReducer(state: MessagingState, action: MessagingAction): MessagingState {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversation: action.payload };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: [
            action.payload.message,
            ...(state.messages[action.payload.conversationId] || []),
          ],
        },
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: action.payload.messages,
        },
      };
    case 'SET_TYPING':
      const updatedIndicators = state.typingIndicators.filter(
        (indicator) => indicator.user_id !== action.payload.user_id
      );
      if (action.payload.isTyping) {
        updatedIndicators.push(action.payload);
      }
      return { ...state, typingIndicators: updatedIndicators };
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LOADING_MESSAGES':
      return { ...state, loadingMessages: action.payload };
    case 'SET_HAS_MORE_MESSAGES':
      return { ...state, hasMoreMessages: action.payload };
    case 'SET_PRESENCE':
      // Presence update can be tracked here if needed
      return state;
    default:
      return state;
  }
}

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(messagingReducer, initialState);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Connect to presence WebSocket
    messagingService.connect();
    
    // Set up event listeners
    messagingService.addEventListener('message_created', (data: { message: Message }) => {
      // The message from the server already has the correct type
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { 
          conversationId: state.activeConversation?.id || data.message.sender_id, 
          message: data.message 
        } 
      });
    });
    
    messagingService.addEventListener('typing', (data: TypingIndicator) => {
      dispatch({ type: 'SET_TYPING', payload: data });
    });
    
    messagingService.addEventListener('read_receipt', (data: { message_id: string }) => {
      // handle read receipt if needed
    });
    
    messagingService.addEventListener('presence', (data: any) => {
      dispatch({ type: 'SET_PRESENCE', payload: data });
    });
    
    // Load conversations
    loadConversations();

    return () => {
      // Clean up event listeners and close WebSocket connection
      messagingService.disconnect();
    };
  }, []);

  const loadConversations = async () => {
    try {
      const conversations = await messagingService.getConversations();
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load conversations' });
    }
  };

  const setActiveConversation = async (conversation: { id: string; name: string } | null) => {
    // Disconnect from current conversation if any
    messagingService.disconnect();
    
    // Update state with new active conversation
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation });
    
    if (conversation) {
      dispatch({ type: 'SET_LOADING_MESSAGES', payload: true });
      
      try {
        // Load messages for the conversation
        const msgs = await messagingService.getMessages(conversation.id);
        dispatch({ type: 'SET_MESSAGES', payload: { conversationId: conversation.id, messages: msgs } });
        dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: msgs.length > 0 });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages' });
      }
      
      dispatch({ type: 'SET_LOADING_MESSAGES', payload: false });
      
      // Connect to the conversation-specific WebSocket
      await messagingService.connect(conversation.id);
    }
  };

  const sendMessage = async (content: string, attachment?: File) => {
    try {
      if (!state.activeConversation) return;
      
      // Create a temporary message to show immediately in the UI
      const tempId = `temp-${Date.now()}`;
      const tempMsg: Message = { 
        id: tempId, 
        content, 
        sender_id: '', // Will be set by server
        sender_name: '', // Will be set by server
        message_type: 'text',
        timestamp: new Date().toISOString(), 
        status: 'sending'
      };
      
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { 
          conversationId: state.activeConversation.id, 
          message: tempMsg 
        } 
      });
      
      // Handle file attachment if provided
      let attachmentUrl;
      if (attachment) {
        attachmentUrl = await messagingService.uploadAttachment(attachment, () => {});
      }

      // Send the message through the messagingService
      await messagingService.sendMessage({ 
        content, 
        message_type: attachment ? 'file' : 'text',
        attachment: attachment ? {
          id: '',
          url: attachmentUrl || '',
          type: 'file',
          filename: attachment.name,
          mime_type: attachment.type,
          size: attachment.size
        } : undefined
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await messagingService.markMessageAsRead(messageId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark message as read' });
    }
  };

  const startTyping = () => {
    if (!state.activeConversation) return;
    
    // Send typing indicator through WebSocket
    messagingService.sendTypingIndicator(state.activeConversation.id, true);
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a timeout to automatically stop typing after 2 seconds
    const conversationId = state.activeConversation.id;
    typingTimeoutRef.current = setTimeout(() => 
      messagingService.sendTypingIndicator(conversationId, false), 2000
    );
  };

  const stopTyping = () => {
    if (!state.activeConversation) return;
    
    // Send typing stopped indicator through WebSocket
    messagingService.sendTypingIndicator(state.activeConversation.id, false);
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const loadMoreMessages = async () => {
    try {
      if (!state.activeConversation) return;
      
      const convId = state.activeConversation.id;
      const currentMessages = state.messages[convId] || [];
      
      // Get the ID of the oldest message to paginate
      const lastId = currentMessages[currentMessages.length - 1]?.id;
      
      // Load more messages from the server
      const msgs = await messagingService.getMessages(convId, lastId);
      
      // Append new messages to the existing ones
      dispatch({ 
        type: 'SET_MESSAGES', 
        payload: { 
          conversationId: convId, 
          messages: [...currentMessages, ...msgs] 
        } 
      });
      
      // Update whether there are more messages to load
      dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: msgs.length > 0 });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load more messages' });
    }
  };

  const contextValue: MessagingContextValue = {
    state,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    loadMoreMessages,
    setActiveConversation,
  };

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};