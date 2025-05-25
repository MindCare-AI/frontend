import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ChatbotConversation, 
  ChatbotMessage, 
  CreateChatbotConversationResponse 
} from '../types/chatbot';
import { 
  getChatbotConversations, 
  createChatbotConversation, 
  sendChatbotMessage, 
  getChatbotHistory,
  getChatbotConversation
} from '../hooks/ChatbotScreen/useChatbotApi';

// Get auth headers for API requests
const getAuthHeaders = async () => {
  try {
    // Use consistent token key
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    throw error;
  }
};

class ChatbotService {
  private currentConversation: ChatbotConversation | null = null;
  private conversations: ChatbotConversation[] = [];

  constructor() {
    this.loadConversationFromStorage();
  }

  // Create a new chatbot conversation
  async createConversation(title: string = 'New Conversation'): Promise<CreateChatbotConversationResponse> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      // Get user ID from storage or another source
      const userDataStr = await AsyncStorage.getItem('user');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      
      if (!userData?.id) {
        throw new Error('User ID not found');
      }

      const conversation = await createChatbotConversation(userData.id, title, token);
      
      // Convert to our ChatbotConversation type
      const chatbotConversation: ChatbotConversation = {
        id: conversation.id,
        user: conversation.user,
        title: conversation.title,
        created_at: conversation.created_at,
        last_activity: conversation.last_activity,
        is_active: conversation.is_active,
        last_message: conversation.last_message,
        message_count: conversation.message_count,
        latest_summary: conversation.latest_summary,
        last_message_at: conversation.last_message_at,
        participants: conversation.participants,
        recent_messages: conversation.recent_messages
      };

      this.currentConversation = chatbotConversation;
      await this.saveConversationToStorage();
      
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Get all chatbot conversations for the current user
  async getAllConversations(): Promise<ChatbotConversation[]> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await getChatbotConversations(token);
      this.conversations = response.results;
      return this.conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  // Send a message to the current conversation
  async sendMessage(content: string): Promise<any> {
    if (!this.currentConversation) {
      throw new Error('No active conversation');
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await sendChatbotMessage(
        Number(this.currentConversation.id), 
        content, 
        token
      );
      
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get chat history for a conversation
  async getChatHistory(conversationId: string): Promise<ChatbotMessage[]> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const messages = await getChatbotHistory(Number(conversationId), token);
      return messages;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  // Get a specific conversation
  async getConversation(conversationId: string): Promise<ChatbotConversation> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const conversation = await getChatbotConversation(Number(conversationId), token);
      
      return {
        id: conversation.id,
        user: conversation.user,
        title: conversation.title,
        created_at: conversation.created_at,
        last_activity: conversation.last_activity,
        is_active: conversation.is_active,
        last_message: conversation.last_message,
        message_count: conversation.message_count,
        latest_summary: conversation.latest_summary,
        last_message_at: conversation.last_message_at,
        participants: conversation.participants,
        recent_messages: conversation.recent_messages
      };
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  // Clear conversation history (you might need to implement this in the backend)
  async clearHistory(conversationId: string): Promise<void> {
    // For now, just clear local storage
    this.currentConversation = null;
    await AsyncStorage.removeItem('currentChatbotConversation');
  }

  // Get current conversation
  getCurrentConversation(): ChatbotConversation | null {
    return this.currentConversation;
  }

  // Set current conversation
  setCurrentConversation(conversation: ChatbotConversation | null): void {
    this.currentConversation = conversation;
    this.saveConversationToStorage();
  }

  // Load conversation from local storage
  private async loadConversationFromStorage(): Promise<void> {
    try {
      const conversationStr = await AsyncStorage.getItem('currentChatbotConversation');
      if (conversationStr) {
        this.currentConversation = JSON.parse(conversationStr);
      }
    } catch (error) {
      console.error('Error loading conversation from storage:', error);
    }
  }

  // Save conversation to local storage
  private async saveConversationToStorage(): Promise<void> {
    try {
      if (this.currentConversation) {
        await AsyncStorage.setItem(
          'currentChatbotConversation',
          JSON.stringify(this.currentConversation)
        );
      } else {
        await AsyncStorage.removeItem('currentChatbotConversation');
      }
    } catch (error) {
      console.error('Error saving conversation to storage:', error);
    }
  }
}

// Export singleton instance
export const chatService = new ChatbotService();
export default chatService;
