import { ChatbotConversation, ChatbotMessage } from '../types/chatbot';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_CONVERSATION_KEY = 'current_chatbot_conversation';
const HISTORY_PREFIX = 'chatbot_history_';

/**
 * Service for managing chatbot conversations and local storage
 */
class ChatbotService {
  private currentConversation: ChatbotConversation | null = null;

  /**
   * Initialize the service and load any stored conversation
   */
  constructor() {
    this.loadCurrentConversation();
  }

  /**
   * Load the current conversation from storage
   */
  private async loadCurrentConversation(): Promise<void> {
    try {
      const storedConversation = await AsyncStorage.getItem(CURRENT_CONVERSATION_KEY);
      if (storedConversation) {
        this.currentConversation = JSON.parse(storedConversation);
      }
    } catch (error) {
      console.error('Failed to load conversation from storage:', error);
    }
  }

  /**
   * Get the current active conversation
   */
  getCurrentConversation(): ChatbotConversation | null {
    return this.currentConversation;
  }

  /**
   * Set the current active conversation and store it
   */
  async setCurrentConversation(conversation: ChatbotConversation | null): Promise<void> {
    this.currentConversation = conversation;
    
    try {
      if (conversation) {
        await AsyncStorage.setItem(CURRENT_CONVERSATION_KEY, JSON.stringify(conversation));
      } else {
        await AsyncStorage.removeItem(CURRENT_CONVERSATION_KEY);
      }
    } catch (error) {
      console.error('Failed to store conversation:', error);
    }
  }

  /**
   * Save chat history for a conversation
   */
  async saveChatHistory(conversationId: string, messages: ChatbotMessage[]): Promise<void> {
    try {
      const key = `${HISTORY_PREFIX}${conversationId}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  /**
   * Get chat history for a conversation
   */
  async getChatHistory(conversationId: string): Promise<ChatbotMessage[]> {
    try {
      const key = `${HISTORY_PREFIX}${conversationId}`;
      const storedHistory = await AsyncStorage.getItem(key);
      if (storedHistory) {
        return JSON.parse(storedHistory);
      }
    } catch (error) {
      console.error('Failed to get chat history:', error);
    }
    
    return [];
  }

  /**
   * Clear chat history for a conversation
   */
  async clearHistory(conversationId: string): Promise<void> {
    try {
      const key = `${HISTORY_PREFIX}${conversationId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  }
}

// Create and export a singleton instance
const chatbotService = new ChatbotService();
export default chatbotService;
