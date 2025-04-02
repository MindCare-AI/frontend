//screens/ChatScreen/services/api.ts
import axios from 'axios';
import { API_URL } from '../../../config';
import { Message, ApiErrorResponse, PaginatedMessagesResponse } from '../../../types/chat';

export const fetchInitialMessages = async (
  conversationId: string,
  conversationType: 'one_to_one' | 'group'
): Promise<{ messages: Message[], hasMore: boolean }> => {
  if (!conversationId) {
    console.error('Invalid conversation ID');
    return { messages: [], hasMore: false };
  }
  
  // Use proper pluralization for group conversations: "groups" vs "one_to_one"
  const conversationEndpoint = conversationType === 'group' ? 'groups' : 'one_to_one';
  const endpoint = `${API_URL}/messaging/${conversationEndpoint}/messages/`;

  try {
    const response = await axios.get<PaginatedMessagesResponse>(endpoint, {
      params: { conversation: conversationId }
    });
    
    return { 
      messages: response.data.results, 
      hasMore: response.data.has_more || false
    };
  } catch (error) {
    const axiosError = error as any;
    
    if (axiosError.response) {
      const errorData = axiosError.response.data;
      console.error('Error fetching messages:', errorData.message || 'Unknown error');
      
      if (errorData.errors) {
        Object.entries(errorData.errors).forEach(([field, errors]) => {
          const errorMessages = Array.isArray(errors) ? errors : [];
          console.error(`${field}: ${errorMessages.join(', ')}`);
        });
      }
    } else if (axiosError.request) {
      console.error('Error fetching messages: No response received from server');
    } else {
      console.error('Error fetching messages:', axiosError.message);
    }
    
    return { messages: [], hasMore: false };
  }
};

export const fetchMoreMessages = async (
  conversationId: string,
  conversationType: 'one_to_one' | 'group',
  beforeId?: string
): Promise<{ messages: Message[], hasMore: boolean }> => {
  if (!conversationId) {
    console.error('Invalid conversation ID');
    return { messages: [], hasMore: false };
  }
  
  const conversationEndpoint = conversationType === 'group' ? 'groups' : 'one_to_one';
  const endpoint = `${API_URL}/messaging/${conversationEndpoint}/messages/`;

  try {
    // Include both conversation ID and cursor (beforeId) in params
    const params: Record<string, string> = { conversation: conversationId };
    if (beforeId) {
      params.cursor = beforeId;
    }
    
    const response = await axios.get<PaginatedMessagesResponse>(endpoint, { params });
    
    return { 
      messages: response.data.results, 
      hasMore: response.data.has_more || false
    };
  } catch (error) {
    const axiosError = error as any;
    console.error('Error fetching more messages:', 
      axiosError.response?.data?.message || axiosError.message || 'Unknown error');
    return { messages: [], hasMore: false };
  }
};
