import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatbotMessage, ChatbotConversation } from '../types/chatbot';

class ChatbotService {
  private currentConversation: ChatbotConversation | null = null;
  private readonly STORAGE_KEY = 'chatbot_conversation';
  private readonly MESSAGES_STORAGE_KEY = 'chatbot_messages';

  // Initialize the service
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.currentConversation = JSON.parse(stored);
        console.log('[ChatbotService] Restored conversation:', this.currentConversation?.id);
      }
    } catch (error) {
      console.error('[ChatbotService] Error initializing:', error);
    }
  }

  // Get current conversation
  getCurrentConversation(): ChatbotConversation | null {
    return this.currentConversation;
  }

  // Set current conversation and persist it
  async setCurrentConversation(conversation: ChatbotConversation): Promise<void> {
    this.currentConversation = conversation;
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversation));
      console.log('[ChatbotService] Conversation saved:', conversation.id);
    } catch (error) {
      console.error('[ChatbotService] Error saving conversation:', error);
    }
  }

  // Get chat history for a conversation
  async getChatHistory(conversationId: string): Promise<ChatbotMessage[]> {
    try {
      const key = `${this.MESSAGES_STORAGE_KEY}_${conversationId}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const messages = JSON.parse(stored);
        console.log('[ChatbotService] Loaded', messages.length, 'messages for conversation', conversationId);
        return messages;
      }
      return [];
    } catch (error) {
      console.error('[ChatbotService] Error loading chat history:', error);
      return [];
    }
  }

  // Save chat history for a conversation
  async saveChatHistory(conversationId: string, messages: ChatbotMessage[]): Promise<void> {
    try {
      const key = `${this.MESSAGES_STORAGE_KEY}_${conversationId}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
      console.log('[ChatbotService] Saved', messages.length, 'messages for conversation', conversationId);
    } catch (error) {
      console.error('[ChatbotService] Error saving chat history:', error);
    }
  }

  // Add a message to chat history
  async addMessageToHistory(conversationId: string, message: ChatbotMessage): Promise<void> {
    try {
      const currentHistory = await this.getChatHistory(conversationId);
      const updatedHistory = [...currentHistory, message];
      await this.saveChatHistory(conversationId, updatedHistory);
    } catch (error) {
      console.error('[ChatbotService] Error adding message to history:', error);
    }
  }

  // Clear chat history for a conversation
  async clearHistory(conversationId: string): Promise<void> {
    try {
      const key = `${this.MESSAGES_STORAGE_KEY}_${conversationId}`;
      await AsyncStorage.removeItem(key);
      console.log('[ChatbotService] Cleared history for conversation', conversationId);
    } catch (error) {
      console.error('[ChatbotService] Error clearing history:', error);
    }
  }

  // Clear all chatbot data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      
      // Get all keys and remove chatbot message keys
      const allKeys = await AsyncStorage.getAllKeys();
      const messageKeys = allKeys.filter(key => key.startsWith(this.MESSAGES_STORAGE_KEY));
      
      if (messageKeys.length > 0) {
        await AsyncStorage.multiRemove(messageKeys);
      }
      
      this.currentConversation = null;
      console.log('[ChatbotService] Cleared all chatbot data');
    } catch (error) {
      console.error('[ChatbotService] Error clearing all data:', error);
    }
  }

  // Create a new conversation
  createNewConversation(userId: string, title: string = 'New Conversation'): ChatbotConversation {
    const conversation: ChatbotConversation = {
      id: `chatbot_${Date.now()}`,
      user_id: userId,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.setCurrentConversation(conversation);
    return conversation;
  }

  // Update conversation timestamp
  async updateConversationTimestamp(conversationId: string): Promise<void> {
    if (this.currentConversation?.id === conversationId) {
      this.currentConversation.updated_at = new Date().toISOString();
      await this.setCurrentConversation(this.currentConversation);
    }
  }
}

// Export singleton instance
export default new ChatbotService();
