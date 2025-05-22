import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for the API functions
type ConversationId = string | number;
type UserId = string | number;
type Pagination = { page?: number; limit?: number };

// Get the auth token from storage
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
    console.error('Error getting auth token:', error);
    throw error;
  }
};

// Fetch all conversations for the current user
export const getConversations = async () => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/messaging/all/`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get a conversation by ID (handles both one-to-one and group)
export const getConversationById = async (conversationId: ConversationId) => {
  try {
    const config = await getAuthHeaders();
    
    // First try to get it as a one-to-one conversation
    try {
      const response = await axios.get(`${API_URL}/messaging/one_to_one/${conversationId}/`, config);
      // Return properly structured data with is_group flag
      return {
        ...(typeof response.data === 'object' && response.data !== null ? response.data : {}),
        is_group: false,
      };
    } catch (error) {
      // If it fails, try to get it as a group conversation
      const groupResponse = await axios.get(`${API_URL}/messaging/groups/${conversationId}/`, config);
      // Return properly structured data with is_group flag
      return {
        ...(typeof groupResponse.data === 'object' && groupResponse.data !== null ? groupResponse.data : {}),
        is_group: true,
      };
    }
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    throw error;
  }
};

// Get messages for a conversation
export const getMessages = async (conversationId: ConversationId) => {
  try {
    const conversation = await getConversationById(conversationId);
    
    // If the conversation has messages, return them
    if ('messages' in conversation && Array.isArray(conversation.messages)) {
      return { results: conversation.messages };
    }
    
    // If no messages are found, return an empty array
    return { results: [] };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Send a message (handles both one-to-one and group)
export const sendMessage = async (
  conversationId: ConversationId, 
  content: string, 
  isGroup: boolean = false, 
  attachments: any[] = []
) => {
  try {
    const config = await getAuthHeaders();
    
    // Define the endpoint based on conversation type
    const isGroupConversation = isGroup || await isGroupType(conversationId);
    
    const endpoint = isGroupConversation
      ? `${API_URL}/messaging/groups/messages/`
      : `${API_URL}/messaging/one_to_one/messages/`;
      
    const payload = {
      content,
      conversation: conversationId,
      message_type: 'text',
      attachments: attachments || [],
    };
      
    const response = await axios.post(endpoint, payload, config);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Helper function to determine if a conversation is a group
const isGroupType = async (conversationId: ConversationId): Promise<boolean> => {
  try {
    const conversation = await getConversationById(conversationId);
    return !!conversation.is_group;
  } catch (error) {
    console.error('Error determining conversation type:', error);
    return false;
  }
};

// Create a new one-to-one conversation
export const createConversation = async (participantId: UserId) => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/messaging/one_to_one/`,
      { participant_id: participantId },
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Mark conversation as read (not implemented in backend, so this is a placeholder)
export const markAsRead = async (conversationId: ConversationId) => {
  return Promise.resolve();
};

// Add participant to group conversation
export const addParticipant = async (groupId: ConversationId, userId: UserId) => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/messaging/groups/${groupId}/add_participant/`,
      { user_id: userId },
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
};

// Remove participant from group conversation
export const removeParticipant = async (groupId: ConversationId, userId: UserId) => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/messaging/groups/${groupId}/remove_participant/`,
      { user_id: userId },
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
};
