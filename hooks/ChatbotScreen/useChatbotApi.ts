import axios from 'axios';
import { API_URL } from '../../config';
import { ChatbotResponse, ChatbotConversationResponse } from '../../types/chatbot';

/**
 * Creates a new chatbot conversation
 */
export const createChatbotConversation = async (
  userId: number,
  title: string,
  token: string
): Promise<ChatbotConversationResponse> => {
  try {
    console.log('Creating chatbot conversation with token:', token ? `${token.substring(0, 10)}...` : 'No token!');
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await axios.post<ChatbotConversationResponse>(
      `${API_URL}/chatbot/`,
      {
        user: userId,
        title: title
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
): Promise<ChatbotResponse | null> => {
  try {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await axios.post<ChatbotResponse>(
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
 * Gets the message history for a conversation
 */
export const getChatbotHistory = async (
  conversationId: number,
  token: string
): Promise<any[]> => {
  try {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await axios.get(
      `${API_URL}/chatbot/${conversationId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Type assertion and safe access
    const responseData = response.data as any;
    return responseData?.messages || [];
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
