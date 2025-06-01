import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for Direct Messages API
type ConversationId = string | number;
type UserId = string | number;
type Pagination = { page?: number; limit?: number };

// API Response types
interface ApiResponse<T> {
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface DirectConversation {
  id: string | number;
  participants: any[];
  last_message?: {
    content?: string;
    timestamp?: string;
    sender_name?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at?: string;
  other_user_name?: string;
  other_participant?: {
    id: number;
    username?: string;
    full_name?: string;
  };
  unread_count: number;
  is_group: boolean;
  [key: string]: any;
}

export interface DirectMessage {
  id: string | number;
  content: string;
  sender: {
    id: number;
    username: string;
    full_name?: string;
  };
  timestamp: string;
  conversation: string | number;
  [key: string]: any;
}

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

// Get all direct conversations for the current user
export const getDirectConversations = async (pagination?: Pagination): Promise<ApiResponse<DirectConversation>> => {
  try {
    const config = await getAuthHeaders();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    console.log(`[DirectMessages API] 📋 Fetching direct conversations${queryString ? ` with params: ${queryString}` : ''}`);
    
    const response = await axios.get<ApiResponse<DirectConversation>>(`${API_URL}/messaging/one_to_one/${queryString}`, config);
    
    console.log(`[DirectMessages API] ✅ Fetched ${response.data?.results?.length || 0} direct conversations`);
    
    // Transform and format conversations
    const conversations = (response.data?.results || []).map((conv: DirectConversation) => ({
      ...conv,
      created_at: conv.created_at || new Date().toISOString(),
      updated_at: conv.updated_at || conv.created_at || new Date().toISOString(),
      participants: conv.participants || [],
      last_message: conv.last_message ? {
        content: conv.last_message.content || '',
        timestamp: conv.last_message.timestamp || new Date().toISOString(),
        sender_name: conv.last_message.sender_name || 'Unknown'
      } : undefined
    }));
    
    return {
      results: conversations,
      count: response.data?.count || conversations.length,
      next: response.data?.next,
      previous: response.data?.previous
    };
  } catch (error) {
    console.error('[DirectMessages API] ❌ Error fetching direct conversations:', error);
    throw error;
  }
};

// Get a direct conversation by ID
export const getDirectConversationById = async (conversationId: ConversationId): Promise<DirectConversation> => {
  try {
    const config = await getAuthHeaders();
    
    console.log(`[DirectMessages API] 📋 Fetching direct conversation ${conversationId}`);
    
    const response = await axios.get(`${API_URL}/messaging/one_to_one/${conversationId}/`, config);
    
    console.log(`[DirectMessages API] ✅ Fetched direct conversation ${conversationId}`);
    
    return {
      ...(typeof response.data === 'object' && response.data !== null ? response.data : {}),
      is_group: false,
      // Fix unread_count property access
      unread_count: typeof response.data === 'object' && response.data !== null && 'unread_count' in response.data ? (response.data as any).unread_count || 0 : 0
    } as DirectConversation;
  } catch (error) {
    console.error(`[DirectMessages API] ❌ Error fetching direct conversation ${conversationId}:`, error);
    throw error;
  }
};

// Get messages for a direct conversation
export const getDirectMessages = async (conversationId: ConversationId, pagination?: Pagination): Promise<ApiResponse<DirectMessage>> => {
  try {
    const config = await getAuthHeaders();

    // Build query parameters (unused for conversation endpoint)
    // Fetch full conversation with messages property
    console.log(`[DirectMessages API] 📋 Fetching messages for direct conversation: ${conversationId}`);
    const response = await axios.get<DirectConversation>(
      `${API_URL}/messaging/one_to_one/${conversationId}/`,
      config
    );
    const data = response.data;
    console.log(`[DirectMessages API] ✅ Fetched ${data.messages?.length || 0} messages for direct conversation ${conversationId}`);
    return {
      results: data.messages || [],
      count: data.messages?.length || 0,
      next: null,
      previous: null
    };
  } catch (error) {
    console.error(`[DirectMessages API] ❌ Error fetching messages for direct conversation ${conversationId}:`, error);
    throw error;
  }
};

// Send a message in a direct conversation
export const sendDirectMessage = async (conversationId: ConversationId, content: string, attachments: any[] = []): Promise<DirectMessage> => {
  try {
    const config = await getAuthHeaders();
    console.log(`[DirectMessages API] 📤 Sending message to direct conversation ${conversationId}`);
    const payload = { content, attachments };
    const response = await axios.post<DirectMessage>(
      `${API_URL}/messaging/one_to_one/${conversationId}/messages/`,
      payload,
      config
    );
    console.log(`[DirectMessages API] ✅ Message sent to direct conversation ${conversationId}`);
    return response.data;
  } catch (error) {
    console.error(`[DirectMessages API] ❌ Error sending message to direct conversation ${conversationId}:`, error);
    throw error;
  }
};

// Create a new direct conversation
export const createDirectConversation = async (otherUserId: UserId): Promise<DirectConversation> => {
  try {
    const config = await getAuthHeaders();
    console.log(`[DirectMessages API] 📝 Creating direct conversation with user ${otherUserId}`);
    const response = await axios.post<DirectConversation>(
      `${API_URL}/messaging/one_to_one/`,
      { participant_id: otherUserId },
      config
    );
    console.log(`[DirectMessages API] ✅ Created direct conversation with user ${otherUserId}`);
    return response.data;
  } catch (error) {
    console.error(`[DirectMessages API] ❌ Error creating direct conversation with user ${otherUserId}:`, error);
    throw error;
  }
};

// Delete a direct conversation
export const deleteDirectConversation = async (conversationId: ConversationId): Promise<void> => {
  try {
    const config = await getAuthHeaders();
    
    console.log(`[DirectMessages API] 🗑️ Deleting direct conversation ${conversationId}`);
    
    await axios.delete(`${API_URL}/messaging/one_to_one/${conversationId}/`, config);
    
    console.log(`[DirectMessages API] ✅ Deleted direct conversation ${conversationId}`);
  } catch (error) {
    console.error(`[DirectMessages API] ❌ Error deleting direct conversation ${conversationId}:`, error);
    throw error;
  }
};
