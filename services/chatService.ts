import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { 
  CreateChatbotConversationResponse, 
  SendChatbotMessageResponse,
  ChatbotConversation 
} from '../types/chatbot/chatbot';

// Get auth headers for API requests
const getAuthHeaders = async () => {
  try {
    // Use consistent token key
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
  private currentConversation: ChatbotConversation | null = null;

  constructor() {
    this.baseUrl = `${API_URL}/chatbot`;
  }

  setCurrentConversation(conversation: ChatbotConversation) {
    this.currentConversation = conversation;
  }

  // Create a new chatbot conversation
  async createConversation(title: string): Promise<CreateChatbotConversationResponse> {
    try {
      console.log('[ChatService] 🆕 Creating new chatbot conversation');
      const config = await getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        ...config,
        body: JSON.stringify({ title, is_active: true })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ChatService] ✅ Conversation created:', data);
      
      return {
        id: data.id,
        user: data.user,
        title: data.title,
        created_at: data.created_at,
        last_activity: data.last_activity,
        is_active: data.is_active,
        last_message: data.last_message,
        message_count: data.message_count,
        latest_summary: data.latest_summary,
        last_message_at: data.last_message_at,
        participants: data.participants,
        recent_messages: data.recent_messages || []
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
  async getConversation(conversationId: string | number): Promise<ChatbotConversation> {
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
  async sendMessage(content: string): Promise<SendChatbotMessageResponse | null> {
    if (!this.currentConversation) {
      throw new Error('No active conversation');
    }

    try {
      console.log('[ChatService] 📤 Sending message to conversation:', this.currentConversation.id);
      const config = await getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/${this.currentConversation.id}/send_message/`, {
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
        id: data.id,
        conversation_id: data.conversation_id,
        timestamp: data.timestamp,
        user_message: data.user_message ? {
          id: data.user_message.id,
          content: data.user_message.content,
          timestamp: data.user_message.timestamp,
          message_type: data.user_message.message_type || 'text',
          is_bot: false,
          sender: data.user_message.sender,
          sender_name: data.user_message.sender_name,
          metadata: data.user_message.metadata,
          parent_message: data.user_message.parent_message,
          chatbot_method: data.user_message.chatbot_method,
        } : undefined,
        bot_response: data.bot_response ? {
          id: data.bot_response.id,
          content: data.bot_response.content,
          timestamp: data.bot_response.timestamp,
          message_type: data.bot_response.message_type || 'text',
          is_bot: true,
          sender: data.bot_response.sender,
          sender_name: data.bot_response.sender_name,
          metadata: data.bot_response.metadata,
          parent_message: data.bot_response.parent_message,
          chatbot_method: data.bot_response.chatbot_method,
        } : undefined
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
