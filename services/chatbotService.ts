import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatbotConversation, ChatbotMessage } from '../types/chatbot';
import { getChatbotHistory } from '../hooks/ChatbotScreen/useChatbotApi';

class ChatbotService {
  private currentConversation: ChatbotConversation | null = null;
  private readonly STORAGE_KEY = 'chatbot_conversation';

  // Get the current active conversation
  getCurrentConversation(): ChatbotConversation | null {
    return this.currentConversation;
  }

  // Set the current conversation and cache it
  setCurrentConversation(conversation: ChatbotConversation): void {
    this.currentConversation = conversation;
    this.cacheConversation(conversation);
  }

  // Cache conversation to AsyncStorage
  private async cacheConversation(conversation: ChatbotConversation): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversation));
    } catch (error) {
      console.error('Error caching conversation:', error);
    }
  }

  // Load conversation from cache
  async loadCachedConversation(): Promise<ChatbotConversation | null> {
    try {
      const cached = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        this.currentConversation = JSON.parse(cached);
        return this.currentConversation;
      }
    } catch (error) {
      console.error('Error loading cached conversation:', error);
    }
    return null;
  }

  // Get chat history for a conversation
  async getChatHistory(conversationId: string): Promise<ChatbotMessage[]> {
    try {
      const messages = await getChatbotHistory(parseInt(conversationId), '');
      return messages.map(this.transformMessageData);
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  // Transform API message data to ChatbotMessage format
  private transformMessageData = (msg: any): ChatbotMessage => {
    return {
      id: msg.id?.toString() || '',
      content: msg.content || '',
      sender_id: msg.is_bot ? 'bot' : msg.sender_id?.toString() || 'user',
      sender_name: msg.is_bot ? 'Samantha' : msg.sender_name || 'You',
      timestamp: msg.timestamp || new Date().toISOString(),
      message_type: 'text',
      is_bot: msg.is_bot || false,
      status: 'sent'
    };
  };

  // Clear chat history (placeholder for now)
  async clearHistory(conversationId: string): Promise<void> {
    // This would typically make an API call to clear server-side history
    // For now, we'll just clear the local cache
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      this.currentConversation = null;
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }

  // Clear all cached data
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      this.currentConversation = null;
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Export a singleton instance
export default new ChatbotService();
