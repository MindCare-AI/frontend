import { useState, useEffect, useCallback, useRef } from 'react';
import chatbotService from '../../services/chatbotService';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNetInfo } from '@react-native-community/netinfo';
import { getChatbotConversations } from './useChatbotApi';
import { 
  ChatbotMessage, 
  ChatbotConversation, 
  ChatbotConversationListResponse 
} from '../../types/chatbot';

interface UseChatbotReturn {
  messages: ChatbotMessage[];
  isLoading: boolean; 
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  isTyping: boolean;
  conversation: ChatbotConversation | null;
  retryMessage: (messageId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

export const useChatbot = (): UseChatbotReturn => {
  const { user } = useAuth();
  const netInfo = useNetInfo();
  const { setActiveConversation } = useChat();
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);
  const { accessToken } = useAuth();

  // Initialize chatbot conversation
  useEffect(() => {
    initializeChatbot();
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const initializeChatbot = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we have a valid token
      if (!accessToken) {
        console.error('No access token found when initializing chatbot');
        setError('Authentication error. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      console.log('Initializing chatbot with token:', accessToken ? 'Token exists' : 'No token!');
      
      // Get existing conversations
      const conversationsResponse: ChatbotConversationListResponse = await getChatbotConversations(accessToken);
      
      if (conversationsResponse.results && conversationsResponse.results.length > 0) {
        // Use the most recent conversation
        const mostRecentConversation = conversationsResponse.results[0];
        setConversation(mostRecentConversation);
        setActiveConversation(mostRecentConversation);
        chatbotService.setCurrentConversation(mostRecentConversation);
        
        // Set messages from the conversation
        setMessages(mostRecentConversation.recent_messages || []);
      } else {
        // Create a new conversation if none exist
        if (!user?.id) {
          throw new Error('User ID not available');
        }

        const response = await chatbotService.createConversation('New Conversation');
        
        const newConversation: ChatbotConversation = {
          id: response.id,
          user: response.user,
          title: response.title,
          created_at: response.created_at,
          last_activity: response.last_activity,
          is_active: response.is_active,
          last_message: response.last_message,
          message_count: response.message_count,
          latest_summary: response.latest_summary,
          last_message_at: response.last_message_at,
          participants: response.participants,
          recent_messages: response.recent_messages
        };
        
        setConversation(newConversation);
        setActiveConversation(newConversation);
        
        // Set initial messages if any
        setMessages(newConversation.recent_messages || []);
      }
    } catch (err) {
      setError('Failed to initialize chatbot. Please try again.');
      console.error('Chatbot initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, setActiveConversation, user]);

  const refreshConversations = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const conversationsResponse = await getChatbotConversations(accessToken);
      if (conversation && conversationsResponse.results) {
        // Find the current conversation in the updated list
        const updatedConversation = conversationsResponse.results.find(
          conv => conv.id.toString() === conversation.id.toString()
        );
        
        if (updatedConversation) {
          setConversation(updatedConversation);
          // Sort messages by timestamp to ensure chronological order
          const sortedMessages = (updatedConversation.recent_messages || []).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          setMessages(sortedMessages);
        }
      }
    } catch (err) {
      console.error('Error refreshing conversations:', err);
    }
  }, [accessToken, conversation]);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || !conversation || !accessToken) return;
    
    // Declare tempId at function scope so it's accessible in catch block
    const tempId = `temp-${Date.now()}`;
    
    try {
      // Add user message to UI immediately
      const userMessage: ChatbotMessage = {
        id: tempId,
        content,
        sender: user?.id || null,
        sender_name: user?.username || 'You',
        timestamp: new Date().toISOString(),
        message_type: 'text',
        status: 'sending',
        is_bot: false,
      };
      
      setMessages(prevMessages => {
        const newMessages = [...prevMessages, userMessage];
        // Sort by timestamp to maintain chronological order
        return newMessages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
      
      // Show typing indicator
      setIsTyping(true);
      
      // Send to API and get response
      const response = await chatbotService.sendMessage(content);
      
      // Update messages - replace temp message with confirmed one and add bot response
      if (response) {
        setMessages(prevMessages => {
          // Remove the temporary message
          const filteredMessages = prevMessages.filter(msg => msg.id !== tempId);
          
          const newMessages = [...filteredMessages];
          
          // Add user message if it exists in response
          if (response.user_message) {
            newMessages.push({
              id: response.user_message.id,
              content: response.user_message.content,
              sender: response.user_message.sender,
              sender_name: response.user_message.sender_name || user?.username || 'You',
              timestamp: response.user_message.timestamp,
              message_type: response.user_message.message_type,
              is_bot: response.user_message.is_bot,
              metadata: response.user_message.metadata,
              parent_message: response.user_message.parent_message,
              chatbot_method: response.user_message.chatbot_method,
              status: 'sent'
            });
          }
          
          // Add bot response if it exists
          if (response.bot_response) {
            newMessages.push({
              id: response.bot_response.id,
              content: response.bot_response.content,
              sender: response.bot_response.sender,
              sender_name: response.bot_response.sender_name || 'Samantha',
              timestamp: response.bot_response.timestamp,
              message_type: response.bot_response.message_type,
              is_bot: response.bot_response.is_bot,
              metadata: response.bot_response.metadata,
              parent_message: response.bot_response.parent_message,
              chatbot_method: response.bot_response.chatbot_method,
              status: 'sent'
            });
          }
          
          // Sort by timestamp to maintain chronological order
          return newMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
        
        // Refresh conversation data
        await refreshConversations();
      }
      
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
      
      // Update message status to failed
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempId ? { ...msg, status: 'failed' } : msg
        )
      );
    } finally {
      // Hide typing indicator with a slight delay for UX
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 500);
    }
  }, [conversation, user, accessToken, refreshConversations]);

  const retryMessage = useCallback(async (messageId: string): Promise<void> => {
    const failedMessage = messages.find(m => m.id === messageId && m.status === 'failed');
    if (!failedMessage || !conversation || !accessToken) return;
    
    // Remove the failed message from the UI
    setMessages(prevMessages => 
      prevMessages.filter(msg => msg.id !== messageId)
    );
    
    try {
      // Resend the message content
      await sendMessage(failedMessage.content);
    } catch (err) {
      console.error('Error retrying message:', err);
      // Re-add the failed message back to the UI if retry fails
      setMessages(prevMessages => [...prevMessages, failedMessage]);
    }
  }, [messages, sendMessage, conversation, accessToken]);

  const clearHistory = useCallback(async (): Promise<void> => {
    if (!conversation) return;
    
    try {
      await chatbotService.clearHistory(conversation.id.toString());
      setMessages([]);
    } catch (err) {
      setError('Failed to clear chat history.');
      console.error('Error clearing chat history:', err);
    }
  }, [conversation]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    isTyping,
    conversation,
    retryMessage,
    refreshConversations
  };
};
