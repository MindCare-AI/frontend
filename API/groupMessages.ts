import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GroupConversation } from '../types/messaging/group_messages';

// Get auth token from storage
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
    // Silent error
    throw error;
  }
};

// Get group messages
export const getGroupMessages = async (conversationId: string | number, page = 1, limit = 20) => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/messaging/groups/${conversationId}/messages/?page=${page}&limit=${limit}`,
      config
    );
    return response.data;
  } catch (error) {
    // Silent error
    throw error;
  }
};

// Send a message in a group conversation
export const sendGroupMessage = async (
  conversationId: string | number,
  content: string,
  contentType = 'text'
) => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/messaging/groups/${conversationId}/messages/`,
      {
        content,
        content_type: contentType
      },
      config
    );
    return response.data;
  } catch (error) {
    // Silent error
    throw error;
  }
};

// Get group conversations
export const getGroupConversations = async () => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/messaging/groups/`, config);
    return response.data;
  } catch (error) {
    // Silent error
    throw error;
  }
};

// Delete group conversation
export const deleteGroupConversation = async (conversationId: string | number) => {
  try {
    const config = await getAuthHeaders();
    await axios.delete(`${API_URL}/messaging/groups/${conversationId}/`, config);
    return true;
  } catch (error) {
    // Silent error
    throw error;
  }
};

// Expose GroupConversation interface for other modules
export { GroupConversation };
