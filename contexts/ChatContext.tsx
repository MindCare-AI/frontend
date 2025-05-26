import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ChatbotConversation, ChatbotMessage } from '../types/chatbot/chatbot';
import chatbotService from '../services/chatbotService';

interface ChatContextType {
  activeConversation: ChatbotConversation | null;
  setActiveConversation: (conversation: ChatbotConversation | null) => void;
  clearConversation: () => void;
  conversations: ChatbotConversation[];
  loadConversations: () => Promise<void>;
  isLoadingConversations: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeConversation, setActiveConversation] = useState<ChatbotConversation | null>(null);
  const [conversations, setConversations] = useState<ChatbotConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  const clearConversation = () => {
    if (activeConversation) {
      chatbotService.setCurrentConversation(null);
      setActiveConversation(null);
    }
  };

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      
      // This would typically fetch conversations from an API
      // For now, we'll just use the current conversation if it exists
      const currentConversation = chatbotService.getCurrentConversation();
      if (currentConversation) {
        setConversations([currentConversation]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Load conversations on initial render
  useEffect(() => {
    loadConversations();
  }, []);

  // Update active conversation in service when changed
  useEffect(() => {
    if (activeConversation) {
      chatbotService.setCurrentConversation(activeConversation);
    }
  }, [activeConversation]);

  return (
    <ChatContext.Provider 
      value={{ 
        activeConversation, 
        setActiveConversation, 
        clearConversation,
        conversations,
        loadConversations,
        isLoadingConversations
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
