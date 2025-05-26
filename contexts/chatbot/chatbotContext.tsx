// contexts/chatbot/chatbotContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  ChatbotConversation,
  ChatbotConversationListItem,
  ChatMessage,
  SystemInfo,
  ChatbotContextType,
  ConversationListParams,
  MessagesParams,
  CreateConversationRequest,
  UpdateConversationRequest,
} from '../../types/chatbot/chatbot';
import { chatbotService } from '../../services/chatbotService';

// State interface
interface ChatbotState {
  conversations: (ChatbotConversation | ChatbotConversationListItem)[];
  currentConversation: ChatbotConversation | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendingMessage: boolean;
  loadingMessages: boolean;
  hasMoreMessages: boolean;
  systemInfo: SystemInfo | null;
  initialized: boolean;
}

// Action types
type ChatbotAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: (ChatbotConversation | ChatbotConversationListItem)[] }
  | { type: 'ADD_CONVERSATION'; payload: ChatbotConversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: number; conversation: ChatbotConversation } }
  | { type: 'REMOVE_CONVERSATION'; payload: number }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: ChatbotConversation | null }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_SENDING_MESSAGE'; payload: boolean }
  | { type: 'SET_LOADING_MESSAGES'; payload: boolean }
  | { type: 'SET_HAS_MORE_MESSAGES'; payload: boolean }
  | { type: 'SET_SYSTEM_INFO'; payload: SystemInfo }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: ChatbotState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  sendingMessage: false,
  loadingMessages: false,
  hasMoreMessages: false,
  systemInfo: null,
  initialized: false,
};

// Reducer
const chatbotReducer = (state: ChatbotState, action: ChatbotAction): ChatbotState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    
    case 'ADD_CONVERSATION':
      return { 
        ...state, 
        conversations: [action.payload, ...state.conversations] 
      };
    
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id ? action.payload.conversation : conv
        ),
        currentConversation: state.currentConversation?.id === action.payload.id 
          ? action.payload.conversation 
          : state.currentConversation,
      };
    
    case 'REMOVE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        currentConversation: state.currentConversation?.id === action.payload 
          ? null 
          : state.currentConversation,
        messages: state.currentConversation?.id === action.payload ? [] : state.messages,
      };
    
    case 'SET_CURRENT_CONVERSATION':
      return { 
        ...state, 
        currentConversation: action.payload,
        messages: [], // Clear messages when switching conversations
        hasMoreMessages: false,
      };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGES':
      return { 
        ...state, 
        messages: [...state.messages, ...action.payload] 
      };
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload] 
      };
    
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    
    case 'SET_SENDING_MESSAGE':
      return { ...state, sendingMessage: action.payload };
    
    case 'SET_LOADING_MESSAGES':
      return { ...state, loadingMessages: action.payload };
    
    case 'SET_HAS_MORE_MESSAGES':
      return { ...state, hasMoreMessages: action.payload };
    
    case 'SET_SYSTEM_INFO':
      return { ...state, systemInfo: action.payload };
    
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    
    case 'RESET_STATE':
      return { ...initialState };
    
    default:
      return state;
  }
};

// Create context
const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

// Provider component
interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatbotReducer, initialState);

  // Error handling helper
  const handleError = (error: any, action: string) => {
    console.error(`Chatbot ${action} error:`, error);
    const errorMessage = error.response?.data?.message || error.message || `Failed to ${action}`;
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
    dispatch({ type: 'SET_LOADING', payload: false });
    dispatch({ type: 'SET_SENDING_MESSAGE', payload: false });
    dispatch({ type: 'SET_LOADING_MESSAGES', payload: false });
  };

  // Actions
  const fetchConversations = async (params?: ConversationListParams): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await chatbotService.getConversations(params);
      if (result.success && result.data) {
        dispatch({ type: 'SET_CONVERSATIONS', payload: result.data.results || [] });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to fetch conversations' });
      }
    } catch (error) {
      handleError(error, 'fetch conversations');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createConversation = async (data?: CreateConversationRequest): Promise<ChatbotConversation | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await chatbotService.createConversation(data);
      if (result.success && result.data) {
        dispatch({ type: 'ADD_CONVERSATION', payload: result.data });
        dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: result.data });
        return result.data;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to create conversation' });
        return null;
      }
    } catch (error) {
      handleError(error, 'create conversation');
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateConversation = async (id: number, data: UpdateConversationRequest): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await chatbotService.updateConversation(id, data);
      if (result.success && result.data) {
        dispatch({ 
          type: 'UPDATE_CONVERSATION', 
          payload: { id, conversation: result.data } 
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to update conversation' });
      }
    } catch (error) {
      handleError(error, 'update conversation');
    }
  };

  const deleteConversation = async (id: number): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await chatbotService.deleteConversation(id);
      if (result.success) {
        dispatch({ type: 'REMOVE_CONVERSATION', payload: id });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to delete conversation' });
      }
    } catch (error) {
      handleError(error, 'delete conversation');
    }
  };

  const toggleConversationActive = async (id: number, isActive?: boolean): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await chatbotService.toggleConversationActive(id, isActive);
      if (result.success && result.data) {
        dispatch({ 
          type: 'UPDATE_CONVERSATION', 
          payload: { id, conversation: result.data.conversation } 
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to toggle conversation status' });
      }
    } catch (error) {
      handleError(error, 'toggle conversation status');
    }
  };

  const clearConversation = async (id: number): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await chatbotService.clearConversation(id);
      if (result.success) {
        // If it's the current conversation, clear messages
        if (state.currentConversation?.id === id) {
          dispatch({ type: 'CLEAR_MESSAGES' });
        }
        // Refresh conversations to get updated message counts
        await fetchConversations();
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to clear conversation' });
      }
    } catch (error) {
      handleError(error, 'clear conversation');
    }
  };

  const fetchMessages = async (conversationId: number, params?: MessagesParams): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING_MESSAGES', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await chatbotService.getMessages(conversationId, params);
      if (result.success && result.data) {
        dispatch({ type: 'SET_MESSAGES', payload: result.data.messages });
        dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: result.data.has_more });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to fetch messages' });
      }
    } catch (error) {
      handleError(error, 'fetch messages');
    } finally {
      dispatch({ type: 'SET_LOADING_MESSAGES', payload: false });
    }
  };

  const loadMoreMessages = async (conversationId: number): Promise<void> => {
    if (!state.hasMoreMessages || state.loadingMessages) return;
    
    try {
      dispatch({ type: 'SET_LOADING_MESSAGES', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await chatbotService.getMessages(conversationId, {
        offset: state.messages.length,
        limit: 20,
      });
      
      if (result.success && result.data) {
        dispatch({ type: 'ADD_MESSAGES', payload: result.data.messages });
        dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: result.data.has_more });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to load more messages' });
      }
    } catch (error) {
      handleError(error, 'load more messages');
    } finally {
      dispatch({ type: 'SET_LOADING_MESSAGES', payload: false });
    }
  };

  const sendMessage = async (conversationId: number, content: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await chatbotService.sendMessage(conversationId, content);
      if (result.success && result.data) {
        // Add both user message and bot response
        dispatch({ type: 'ADD_MESSAGE', payload: result.data.user_message });
        dispatch({ type: 'ADD_MESSAGE', payload: result.data.bot_response });
        
        // Update conversation in list with new last activity
        const updatedConversations = state.conversations.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                last_activity: result.data.bot_response.timestamp,
                message_count: ('message_count' in conv ? conv.message_count : 0) + 2 
              }
            : conv
        );
        dispatch({ type: 'SET_CONVERSATIONS', payload: updatedConversations });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to send message' });
      }
    } catch (error) {
      handleError(error, 'send message');
    } finally {
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: false });
    }
  };

  const setCurrentConversation = (conversation: ChatbotConversation | null): void => {
    dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation });
  };

  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const fetchSystemInfo = async (): Promise<void> => {
    try {
      const result = await chatbotService.getSystemInfo();
      if (result.success && result.data) {
        dispatch({ type: 'SET_SYSTEM_INFO', payload: result.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to fetch system info' });
      }
    } catch (error) {
      handleError(error, 'fetch system info');
    }
  };

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      if (!state.initialized) {
        await fetchConversations();
        await fetchSystemInfo();
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    };
    
    initialize();
  }, [state.initialized]);

  const contextValue: ChatbotContextType = {
    // State
    conversations: state.conversations,
    currentConversation: state.currentConversation,
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    sendingMessage: state.sendingMessage,
    loadingMessages: state.loadingMessages,
    hasMoreMessages: state.hasMoreMessages,
    systemInfo: state.systemInfo,
    
    // Actions
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
    toggleConversationActive,
    clearConversation,
    fetchMessages,
    sendMessage,
    loadMoreMessages,
    setCurrentConversation,
    clearError,
    fetchSystemInfo,
  };

  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
    </ChatbotContext.Provider>
  );
};

// Hook to use the context
export const useChatbotContext = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider');
  }
  return context;
};

export default ChatbotContext;