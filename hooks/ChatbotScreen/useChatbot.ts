import { useState, useEffect, useCallback, useRef } from 'react';
import chatbotService from '../../services/chatbotService';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNetInfo } from '@react-native-community/netinfo';
import { createChatbotConversation, sendChatbotMessage } from './useChatbotApi';
import { 
  ChatbotMessage, 
  ChatbotConversation, 
  ChatbotMessageData, 
  ChatbotResponse 
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
      
      // Try to use a cached conversation
      const activeConv = chatbotService.getCurrentConversation();
      
      if (activeConv) {
        setConversation(activeConv);
        setActiveConversation(activeConv);
        
        // Get messages for existing conversation
        const chatHistory = await chatbotService.getChatHistory(activeConv.id.toString());
        setMessages(chatHistory);
      } else {
        // Initialize a new conversation
        if (!user?.id) {
          throw new Error('User ID not available');
        }

        const response = await createChatbotConversation(
          user.id,
          'New Conversation',
          accessToken
        );
        
        const userId = user.id.toString();
        
        const newConversation: ChatbotConversation = {
          id: response.id.toString(),
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          title: response.title || 'New Conversation'
        };
        
        setConversation(newConversation);
        setActiveConversation(newConversation);
        chatbotService.setCurrentConversation(newConversation);
        
        // If the response contains an initial message, add it
        if (response.messages && response.messages.length > 0) {
          const initialMessages: ChatbotMessage[] = response.messages.map((msg: ChatbotMessageData) => ({
            id: msg.id.toString(),
            content: msg.content,
            sender_id: msg.is_bot ? 'bot' : userId,
            sender_name: msg.is_bot ? 'Samantha' : user?.username || 'You',
            timestamp: msg.timestamp,
            message_type: 'text',
            is_bot: msg.is_bot || false
          }));
          setMessages(initialMessages);
        }
      }
    } catch (err) {
      setError('Failed to initialize chatbot. Please try again.');
      console.error('Chatbot initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, setActiveConversation, user]);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || !conversation || !accessToken) return;
    
    try {
      // Add user message to UI immediately
      const tempId = `temp-${Date.now()}`;
      const userMessage: ChatbotMessage = {
        id: tempId,
        content,
        sender_id: user?.id ? String(user.id) : 'user',
        sender_name: user?.username || 'You',
        timestamp: new Date().toISOString(),
        message_type: 'text',
        status: 'sending',
        is_bot: false,
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Show typing indicator
      setIsTyping(true);
      
      // Send to API and get response
      const response = await sendChatbotMessage(
        parseInt(conversation.id),
        content,
        accessToken
      );
      
      // Update messages - replace temp message with confirmed one and add bot response
      if (response) {
        setMessages(prevMessages => {
          // Replace the temporary message with the confirmed one
          const updatedMessages = prevMessages.map(msg => 
            msg.id === tempId ? {
              ...msg,
              id: response.user_message?.id || `user-${Date.now()}`,
              status: 'sent' as 'sent'
            } : msg
          );
          
          // Add bot response if it exists
          if (response.bot_response) {
            const botMessage: ChatbotMessage = {
              id: response.bot_response.id || `bot-${Date.now()}`,
              content: response.bot_response.content,
              sender_id: 'bot',
              sender_name: 'Samantha',
              timestamp: response.bot_response.timestamp || new Date().toISOString(),
              message_type: 'text',
              is_bot: true,
              status: 'sent'
            };
            return [...updatedMessages, botMessage];
          }
          
          return updatedMessages;
        });
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
  }, [conversation, user, accessToken]);

  const retryMessage = useCallback(async (messageId: string): Promise<void> => {
    const failedMessage = messages.find(m => m.id === messageId && m.status === 'failed');
    if (!failedMessage) return;
    
    // Update message status to sending
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sending' } : msg
      )
    );
    
    try {
      await sendMessage(failedMessage.content);
      
      // Remove the failed message since a new one will be created
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== messageId)
      );
    } catch (err) {
      console.error('Error retrying message:', err);
      // Message will be marked as failed again by sendMessage
    }
  }, [messages, sendMessage]);

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
    retryMessage
  };
};
