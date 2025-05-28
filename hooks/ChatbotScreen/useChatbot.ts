import { useState, useEffect, useCallback } from 'react';
import { chatbotApi } from '../../API/chatbot/chatbot';
import {
  ChatbotConversation,
  ChatbotConversationListItem,
  ChatMessage,
  ConversationListParams,
  MessagesParams,
  CreateConversationRequest,
  UpdateConversationRequest,
  SystemInfo,
} from '../../types/chatbot/chatbot';

// Custom state interface for the hook
interface ChatbotHookState {
  conversations: (ChatbotConversation | ChatbotConversationListItem)[];
  currentConversation: ChatbotConversation | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendingMessage: boolean;
  loadingMessages: boolean;
  hasMoreMessages: boolean;
  systemInfo: SystemInfo | null;
}

const INITIAL_STATE: ChatbotHookState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  sendingMessage: false,
  loadingMessages: false,
  hasMoreMessages: false,
  systemInfo: null,
};

export const useChatbot = () => {
  const [state, setState] = useState<ChatbotHookState>(INITIAL_STATE);

  // Helper function to update state
  const updateState = useCallback((updates: Partial<ChatbotHookState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Error handling
  const handleError = useCallback((error: any, action: string) => {
    console.error(`Chatbot ${action} error:`, error);
    updateState({
      error: error.response?.data?.message || error.message || `Failed to ${action}`,
      loading: false,
      sendingMessage: false,
      loadingMessages: false,
    });
  }, [updateState]);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Fetch conversations
  const fetchConversations = useCallback(async (params?: ConversationListParams) => {
    try {
      updateState({ loading: true, error: null });
      const response = await chatbotApi.getConversations(params);
      updateState({
        conversations: response.results || [],
        loading: false,
      });
    } catch (error) {
      handleError(error, 'fetch conversations');
    }
  }, [updateState, handleError]);

  // Create conversation
  const createConversation = useCallback(async (data?: CreateConversationRequest) => {
    try {
      updateState({ loading: true, error: null });
      const conversation = await chatbotApi.createConversation(data);
      updateState({
        conversations: [conversation, ...state.conversations],
        currentConversation: conversation,
        loading: false,
      });
      return conversation;
    } catch (error) {
      handleError(error, 'create conversation');
      return null;
    }
  }, [state.conversations, updateState, handleError]);

  // Update conversation
  const updateConversation = useCallback(async (id: number, data: UpdateConversationRequest) => {
    try {
      updateState({ error: null });
      const updatedConversation = await chatbotApi.updateConversation(id, data);
      
      updateState({
        conversations: state.conversations.map((conv: ChatbotConversation | ChatbotConversationListItem) => 
          conv.id === id ? updatedConversation : conv
        ),
        currentConversation: state.currentConversation?.id === id 
          ? updatedConversation 
          : state.currentConversation,
      });
    } catch (error) {
      handleError(error, 'update conversation');
    }
  }, [state.conversations, state.currentConversation, updateState, handleError]);

  // Delete conversation
  const deleteConversation = useCallback(async (id: number) => {
    try {
      updateState({ error: null });
      await chatbotApi.deleteConversation(id);
      
      updateState({
        conversations: state.conversations.filter((conv: ChatbotConversation | ChatbotConversationListItem) => conv.id !== id),
        currentConversation: state.currentConversation?.id === id 
          ? null 
          : state.currentConversation,
        messages: state.currentConversation?.id === id ? [] : state.messages,
      });
    } catch (error) {
      handleError(error, 'delete conversation');
    }
  }, [state.conversations, state.currentConversation, state.messages, updateState, handleError]);

  // Toggle conversation active status
  const toggleConversationActive = useCallback(async (id: number, isActive?: boolean) => {
    try {
      updateState({ error: null });
      const response = await chatbotApi.toggleConversationActive(id, isActive);
      
      updateState({
        conversations: state.conversations.map((conv: ChatbotConversation | ChatbotConversationListItem) => 
          conv.id === id ? response.conversation : conv
        ),
        currentConversation: state.currentConversation?.id === id 
          ? response.conversation 
          : state.currentConversation,
      });
    } catch (error) {
      handleError(error, 'toggle conversation status');
    }
  }, [state.conversations, state.currentConversation, updateState, handleError]);

  // Clear conversation
  const clearConversation = useCallback(async (id: number) => {
    try {
      updateState({ error: null });
      await chatbotApi.clearConversation(id);
      
      // If it's the current conversation, clear messages
      if (state.currentConversation?.id === id) {
        updateState({ messages: [] });
      }
      
      // Refresh conversations to get updated message counts
      await fetchConversations();
    } catch (error) {
      handleError(error, 'clear conversation');
    }
  }, [state.currentConversation, updateState, handleError, fetchConversations]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: number, params?: MessagesParams) => {
    try {
      updateState({ loadingMessages: true, error: null });
      
      // First, check if the conversation exists and fetch it if needed
      let currentConv = state.currentConversation;
      if (!currentConv || currentConv.id !== conversationId) {
        try {
          console.log('[useChatbot] Fetching conversation:', conversationId);
          const conversationResponse = await chatbotApi.getConversation(conversationId);
          currentConv = conversationResponse;
          updateState({ currentConversation: conversationResponse });
        } catch (error) {
          console.error('[useChatbot] Failed to fetch conversation:', error);
          handleError(error, 'fetch conversation');
          return;
        }
      }
      
      console.log('[useChatbot] Fetching messages for conversation:', conversationId);
      const response = await chatbotApi.getMessages(conversationId, params);
      
      // Add a delay to ensure UI updates properly
      setTimeout(() => {
        // Sort messages by timestamp (oldest first) for proper display
        const sortedMessages = response.messages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        updateState({
          messages: sortedMessages,
          hasMoreMessages: response.has_more,
          loadingMessages: false,
        });
        
        console.log('[useChatbot] Fetched', sortedMessages.length, 'messages');
      }, 300);
    } catch (error) {
      handleError(error, 'fetch messages');
    }
  }, [state.currentConversation, updateState, handleError]);

  // Load more messages (for pagination)
  const loadMoreMessages = useCallback(async (conversationId: number) => {
    if (!state.hasMoreMessages || state.loadingMessages) return;
    
    try {
      updateState({ loadingMessages: true, error: null });
      const response = await chatbotApi.getMessages(conversationId, {
        offset: state.messages.length,
        limit: 20,
      });
      
      // Sort new messages by timestamp (oldest first)
      const sortedNewMessages = response.messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      updateState({
        messages: [...state.messages, ...sortedNewMessages], // Append older messages at the end
        hasMoreMessages: response.has_more,
        loadingMessages: false,
      });
    } catch (error) {
      handleError(error, 'load more messages');
    }
  }, [state.hasMoreMessages, state.loadingMessages, state.messages, updateState, handleError]);

  // Send message
  const sendMessage = useCallback(async (conversationId: number, content: string) => {
    console.log('[useChatbot] sendMessage called with:', { conversationId, content });
    try {
      updateState({ sendingMessage: true, error: null });
      console.log('[useChatbot] About to call chatbotApi.sendMessage');
      const response = await chatbotApi.sendMessage(conversationId, content);
      console.log('[useChatbot] sendMessage response:', response);
      
      // Add both user message and bot response to messages
      setState(prevState => {
        // Extract previous messages
        const prevMessages = [...prevState.messages];
        
        // Add user message immediately
        prevMessages.push(response.user_message);
        
        // Add bot response with typing property
        const botResponse = {
          ...response.bot_response,
          typing: true // Now properly typed in the interface
        };
        
        prevMessages.push(botResponse);
        
        return {
          ...prevState,
          messages: prevMessages,
          sendingMessage: false,
          conversations: prevState.conversations.map((conv: ChatbotConversation | ChatbotConversationListItem) => 
            conv.id === conversationId 
              ? { 
                  ...conv, 
                  last_activity: response.bot_response.timestamp,
                  message_count: ('message_count' in conv ? conv.message_count : 0) + 2 
                }
              : conv
          ),
        };
      });
    } catch (error) {
      console.log('[useChatbot] sendMessage error:', error);
      handleError(error, 'send message');
    }
  }, [updateState, handleError]);

  // Set current conversation
  const setCurrentConversation = useCallback((conversation: ChatbotConversation | null) => {
    if (conversation && conversation.messages) {
      // Sort messages from the conversation if they exist
      const sortedMessages = conversation.messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      updateState({ 
        currentConversation: conversation,
        messages: sortedMessages,
        hasMoreMessages: false,
        loadingMessages: false,
      });
    } else {
      updateState({ 
        currentConversation: conversation,
        messages: [],
        hasMoreMessages: false,
        loadingMessages: false,
      });
    }
  }, [updateState]);

  // Set messages directly
  const setMessages = useCallback((messages: ChatMessage[]) => {
    updateState({ messages });
  }, [updateState]);

  // Fetch system info
  const fetchSystemInfo = useCallback(async () => {
    try {
      const systemInfo = await chatbotApi.getSystemInfo();
      updateState({ systemInfo });
    } catch (error) {
      handleError(error, 'fetch system info');
    }
  }, [updateState, handleError]);

  // Initialize conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    // State
    ...state,
    
    // Actions
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
    toggleConversationActive,
    clearConversation,
    fetchMessages,
    loadMoreMessages,
    sendMessage,
    setCurrentConversation,
    setMessages,
    clearError,
    fetchSystemInfo,
  };
};
