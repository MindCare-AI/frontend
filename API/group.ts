import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a custom axios instance for this file to prevent console errors
const silentAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to prevent error logging
silentAxios.interceptors.response.use(
  response => response,
  error => {
    // Silently catch errors without logging to console
    return Promise.reject({
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
);

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
    // Auth token error silently suppressed
    throw error;
  }
};

interface GroupConversation {
  id: string | number;
  name: string;
  description?: string;
  participants: (string | number)[];
  created_at: string;
  updated_at?: string;
}

interface GroupConversationCreateParams {
  name: string;
  description?: string;
  participants: (string | number)[];
}

export const createGroupConversation = async (params: GroupConversationCreateParams): Promise<GroupConversation> => {
  try {
    const config = await getAuthHeaders();

    // Get current user ID from stored user data
    const userData = await AsyncStorage.getItem('userData');
    const currentUserId = userData ? JSON.parse(userData).id : null;

    // Validate inputs
    if (!params.name || params.name.trim() === '') {
      throw new Error('Group name is required');
    }

    if (!Array.isArray(params.participants) || params.participants.length === 0) {
      throw new Error('At least one participant is required');
    }

    // Ensure currentUserId is valid before adding it to participants
    if (!currentUserId) {
      throw new Error('Invalid current user ID');
    }

    // Ensure the request body has the correct structure
    const requestBody = {
      name: params.name.trim(),
      description: params.description?.trim() || '',
      participants: [...new Set([...params.participants, currentUserId].filter(Boolean))],
    };

    console.log('[createGroupConversation] Payload:', requestBody);

    // Use silentAxios instead of axios to prevent console errors
    const response = await silentAxios.post(
      `${API_URL}/messaging/groups/`,
      requestBody,
      config
    );

    return response.data as GroupConversation;
  } catch (error: any) {
    console.error('[createGroupConversation] Error:', error);
    const customError: any = new Error(error?.message || 'Unknown error');
    customError.status = error?.status;
    customError.data = error?.data;
    throw customError;
  }
};
