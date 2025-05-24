import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { 
  ChatbotConversation, 
  ChatbotMessage, 
  ChatbotResponse,
  CreateChatbotConversationResponse,
  SendChatbotMessageResponse 
} from '../types/chatbot';

// Get auth headers for API requests
const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };
  } catch (error) {
    console.error('[ChatService] Error getting auth token:', error);
    throw error;
  }
};

class ChatService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_URL}/chatbot`;
  }

  // Create a new chatbot conversation
  async createConversation(title?: string): Promise<CreateChatbotConversationResponse> {
    try {
      console.log('[ChatService] 🆕 Creating new chatbot conversation');
      const config = await getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/conversations/`, {
        method: 'POST',
        ...config,
        body: JSON.stringify({ title: title || 'New Chat' })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ChatService] ✅ Conversation created:', data);
      
      return {
        id: data.id,
        title: data.title,
        messages: data.messages || []
      };
    } catch (error) {
      console.error('[ChatService] ❌ Error creating conversation:', error);
      throw error;
    }
  }

  // Get all chatbot conversations for the current user
  async getConversations(): Promise<ChatbotConversation[]> {
    try {
      console.log('[ChatService] 📋 Fetching chatbot conversations');
      const config = await getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/conversations/`, {
        method: 'GET',
        ...config
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ChatService] ✅ Fetched conversations:', data.results?.length || 0);
      
      return data.results || [];
    } catch (error) {
      console.error('[ChatService] ❌ Error fetching conversations:', error);
      throw error;
    }
  }

  // Get a specific chatbot conversation by ID
  async getConversation(conversationId: string | number): Promise<ChatbotResponse> {
    try {
      console.log('[ChatService] 📋 Fetching conversation:', conversationId);
      const config = await getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/`, {
        method: 'GET',
        ...config
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ChatService] ✅ Fetched conversation:', data);
      
      return data;
    } catch (error) {
      console.error('[ChatService] ❌ Error fetching conversation:', error);
      throw error;
    }
  }

  // Send a message to the chatbot
  async sendMessage(conversationId: string | number, content: string): Promise<SendChatbotMessageResponse> {
    try {
      console.log('[ChatService] 📤 Sending message to conversation:', conversationId);
      const config = await getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages/`, {
        method: 'POST',
        ...config,
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ChatService] ✅ Message sent, received response:', data);
      
      return {
        user_message: {
          id: data.user_message?.id || '',
          content: data.user_message?.content || content,
          timestamp: data.user_message?.timestamp || new Date().toISOString()
        },
        bot_response: {
          id: data.bot_response?.id || '',
          content: data.bot_response?.content || '',
          timestamp: data.bot_response?.timestamp || new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('[ChatService] ❌ Error sending message:', error);
      throw error;
    }
  }

  // Delete a chatbot conversation
  async deleteConversation(conversationId: string | number): Promise<void> {
    try {
      console.log('[ChatService] 🗑️ Deleting conversation:', conversationId);
      const config = await getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/`, {
        method: 'DELETE',
        ...config
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('[ChatService] ✅ Conversation deleted');
    } catch (error) {
      console.error('[ChatService] ❌ Error deleting conversation:', error);
      throw error;
    }
  }

  // Update conversation title
  async updateConversationTitle(conversationId: string | number, title: string): Promise<ChatbotConversation> {
    try {
      console.log('[ChatService] ✏️ Updating conversation title:', conversationId);
      const config = await getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/`, {
        method: 'PATCH',
        ...config,
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ChatService] ✅ Conversation title updated:', data);
      
      return data;
    } catch (error) {
      console.error('[ChatService] ❌ Error updating conversation title:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
