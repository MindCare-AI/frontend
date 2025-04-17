import axios from 'axios';
import { API_URL } from '../../../config';

// Create a chatbot conversation
export const createChatbotConversation = async (
  initialMessage: string,
  accessToken: string
) => {
  const endpoint = `${API_URL}/messaging/chatbot/`;
  const payload = { initial_message: initialMessage };
  const response = await axios.post(endpoint, payload, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
};

// Retrieve a chatbot conversation
export const getChatbotConversation = async (
  conversationId: number,
  accessToken: string
) => {
  const endpoint = `${API_URL}/messaging/chatbot/${conversationId}/`;
  const response = await axios.get(endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
};

// Send a message to the chatbot
export const sendChatbotMessage = async (
  conversationId: number,
  message: string,
  accessToken: string
) => {
  const endpoint = `${API_URL}/messaging/chatbot/${conversationId}/send_message/`;
  const payload = { message };
  const response = await axios.post(endpoint, payload, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
};
