import axios from 'axios';
import { API_URL } from '../../config';
import { 
  CreateChatbotConversationResponse, 
  SendChatbotMessageResponse,
  ChatbotConversationListResponse,
  ChatbotMessage 
} from '../../types/chatbot';

/**
 * Gets all chatbot conversations for the current user
 */
export const getChatbotConversations = async (
  token: string
): Promise<ChatbotConversationListResponse> => {
  try {
    console.log('Getting chatbot conversations with token:', token ? `${token.substring(0, 10)}...` : 'No token!');
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await axios.get<ChatbotConversationListResponse>(
      `${API_URL}/chatbot/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Conversations response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting chatbot conversations:', error);
    throw error;
  }
};

/**
 * Creates a new chatbot conversation
 */
export const createChatbotConversation = async (
  userId: number,
  title: string,
  token: string
): Promise<CreateChatbotConversationResponse> => {
  try {
    console.log('Creating chatbot conversation with token:', token ? `${token.substring(0, 10)}...` : 'No token!');
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await axios.post<CreateChatbotConversationResponse>(
      `${API_URL}/chatbot/`,
      {
        user: userId,
        title: title,
        is_active: true
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Status:', response.status);
    console.log('Response data:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error creating chatbot conversation:', error);
    throw error;
  }
};

/**
 * Sends a message to an existing chatbot conversation
 */
export const sendChatbotMessage = async (
  conversationId: number,
  content: string,
  token: string
): Promise<SendChatbotMessageResponse | null> => {
  try {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await axios.post<SendChatbotMessageResponse>(
      `${API_URL}/chatbot/${conversationId}/send_message/`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending chatbot message:', error);
    throw error;
  }
};

/**
 * Gets a specific chatbot conversation with its messages
 */
export const getChatbotConversation = async (
  conversationId: number,
  token: string
): Promise<CreateChatbotConversationResponse> => {
  try {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await axios.get<CreateChatbotConversationResponse>(
      `${API_URL}/chatbot/${conversationId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting chatbot conversation:', error);
    throw error;
  }
};

/**
 * Gets the message history for a conversation
 */
export const getChatbotHistory = async (
  conversationId: number,
  token: string
): Promise<ChatbotMessage[]> => {
  try {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const conversation = await getChatbotConversation(conversationId, token);
    return conversation.recent_messages || [];
  } catch (error) {
    console.error('Error getting chatbot history:', error);
    throw error;
  }
};

/**
 * Deletes a chatbot conversation
 */
export const deleteChatbotConversation = async (
  conversationId: number,
  token: string
): Promise<void> => {
  try {
    await axios.delete(
      `${API_URL}/chatbot/${conversationId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error deleting chatbot conversation:', error);
    throw error;
  }
};
