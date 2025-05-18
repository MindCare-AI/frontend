import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, ChatbotConversation } from '../../types/chat';
import chatbotService from '../../services/chatbotService';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNetInfo } from '@react-native-community/netinfo';

interface UseChatbotReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  isTyping: boolean;
  conversation: ChatbotConversation | null;
}

export const useChatbot = () => {
  const { user } = useAuth();
  const netInfo = useNetInfo();
  const { setActiveConversation } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);

  // Initialize chatbot conversation
  useEffect(() => {
    initializeChatbot();
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const initializeChatbot = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get or create chatbot conversation
      const existingConversation = chatbotService.getCurrentConversation();
      if (existingConversation) {
        setConversation(existingConversation);
        // Load existing messages
        const history = await chatbotService.getChatHistory(existingConversation.id);
        setMessages(history);
      } else {
        const newConversation = await chatbotService.initializeConversation();
        setConversation(newConversation);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error initializing chatbot:', error);
      setError('Failed to initialize chatbot');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message to the chatbot
  const sendMessage = useCallback(async (content: string) => {
    if (!conversation || !user) return;

    // Create optimistic message
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      content,
      sender: {
        id: user.id,
        name: user.name,
      },
      timestamp: new Date().toISOString(),
      message_type: 'text',
      status: 'sending',
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Show typing indicator
      setIsTyping(true);

      // Send message to chatbot
      const sentMessage = await chatbotService.sendMessage(content);

      // Replace temp message with sent message
      setMessages(prev =>
        prev.map(msg => (msg.id === tempMessage.id ? sentMessage : msg))
      );

      // Wait for bot response (the response will be handled by the WebSocket)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set a maximum typing duration
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 10000); // 10 seconds max typing time

    } catch (error) {
      console.error('Error sending message:', error);
      // Mark message as failed
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
        )
      );
      
      // Show error if we're online (if offline, message is queued)
      if (netInfo.isConnected) {
        setError('Failed to send message');
      }
    }
  }, [conversation, user, netInfo.isConnected]);

  // Clear chat history
  const clearHistory = useCallback(async () => {
    if (!conversation) return;

    try {
      await chatbotService.clearHistory(conversation.id);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing history:', error);
      setError('Failed to clear chat history');
    }
  }, [conversation]);

  // Update active conversation in ChatContext when conversation changes
  useEffect(() => {
    if (conversation) {
      setActiveConversation(conversation.id);
    }
  }, [conversation, setActiveConversation]);

  // Handle new messages from WebSocket (done through ChatContext)
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.conversation_id === conversation?.id) {
        setMessages(prev => [...prev, message]);
        // Clear typing indicator when bot responds
        if (message.sender.id !== user?.id) {
          setIsTyping(false);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
        }
      }
    };

    // Clean up on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversation?.id, user?.id]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    isTyping,
    conversation,
  };
};

export default useChatbot;