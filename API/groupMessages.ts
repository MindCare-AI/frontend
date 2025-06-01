import axios from 'axios';
import { API_URL } from '../config';
import websocketService from '../services/websocketService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for Group Messages API
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

export interface GroupConversation {
  id: string | number;
  name: string;
  participants: any[];
  last_message?: {
    content?: string;
    timestamp?: string;
    sender_name?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at?: string;
  description?: string;
  created_by?: {
    id: number;
    username: string;
    full_name?: string;
  };
  unread_count: number;
  is_group: boolean;
  [key: string]: any;
}

export interface GroupMessage {
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

export interface GroupParticipant {
  id: number;
  username: string;
  full_name?: string;
  role?: string;
  joined_at?: string;
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

// Get all group conversations for the current user
export const getGroupConversations = async (pagination?: Pagination): Promise<ApiResponse<GroupConversation>> => {
  try {
    const config = await getAuthHeaders();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    console.log(`[GroupMessages API] 📋 Fetching group conversations${queryString ? ` with params: ${queryString}` : ''}`);
    
    const response = await axios.get<ApiResponse<GroupConversation>>(`${API_URL}/messaging/groups/${queryString}`, config);
    
    console.log(`[GroupMessages API] ✅ Fetched ${response.data?.results?.length || 0} group conversations`);
    
    // Transform and format conversations
    const conversations = (response.data?.results || []).map((conv: GroupConversation) => ({
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
    console.error('[GroupMessages API] ❌ Error fetching group conversations:', error);
    throw error;
  }
};

// Get a group conversation by ID
export const getGroupConversationById = async (conversationId: ConversationId): Promise<GroupConversation> => {
  try {
    const config = await getAuthHeaders();
    
    console.log(`[GroupMessages API] 📋 Fetching group conversation ${conversationId}`);
    
    const response = await axios.get(`${API_URL}/messaging/groups/${conversationId}/`, config);
    
    console.log(`[GroupMessages API] ✅ Fetched group conversation ${conversationId}`);
    
    return {
      ...(typeof response.data === 'object' && response.data !== null ? response.data : {}),
      is_group: true,
      // Fix unread_count property access
      unread_count: typeof response.data === 'object' && response.data !== null && 'unread_count' in response.data ? (response.data as any).unread_count || 0 : 0
    } as GroupConversation;
  } catch (error) {
    console.error(`[GroupMessages API] ❌ Error fetching group conversation ${conversationId}:`, error);
    throw error;
  }
};

// Get messages for a group conversation
export const getGroupMessages = async (conversationId: ConversationId, pagination?: Pagination): Promise<ApiResponse<GroupMessage>> => {
  try {
    const config = await getAuthHeaders();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    console.log(`[GroupMessages API] 📋 Fetching messages for group conversation ${conversationId}${queryString ? ` with params: ${queryString}` : ''}`);
    
    const response = await axios.get<ApiResponse<GroupMessage>>(`${API_URL}/messaging/groups/${conversationId}/messages/${queryString}`, config);
    
    console.log(`[GroupMessages API] ✅ Fetched ${response.data?.results?.length || 0} messages for group conversation ${conversationId}`);
    
    return response.data || { results: [], count: 0 } as ApiResponse<GroupMessage>;
  } catch (error) {
    console.error(`[GroupMessages API] ❌ Error fetching messages for group conversation ${conversationId}:`, error);
    throw error;
  }
};

// Send a message in a group conversation
export const sendGroupMessage = async (
  conversationId: ConversationId,
  content: string,
  attachments: any[] = []
): Promise<GroupMessage> => {
  console.group(`[GroupMessages API] 📤 sendGroupMessage called for group: ${conversationId}`);
  try {
    // Try WebSocket first for real-time send
    const isWS = websocketService.isConnected() && websocketService.getCurrentConversationId() === conversationId.toString();
    if (isWS) {
      console.log('[GroupMessages API] 🌐 Sending via WebSocket');
      websocketService.sendMessage({
        content,
        message_type: 'text',
        metadata: { source: 'GroupMessagesAPI' },
        ...(attachments.length > 0 && { media_id: attachments[0]?.id })
      });
      // Return temporary message object
      const tempMsg: GroupMessage = {
        id: `temp-${Date.now()}`,
        content,
        conversation: conversationId,
        sender: { id: 0, username: 'You' },
        timestamp: new Date().toISOString()
      } as any;
      return tempMsg;
    }
    console.log('[GroupMessages API] 📍 Using REST API');
    const config = await getAuthHeaders();
    const payload = { content, attachments };
    console.log('[GroupMessages API] 📤 Payload:', payload);
    const response = await axios.post<GroupMessage>(
      `${API_URL}/messaging/groups/${conversationId}/messages/`,
      payload,
      config
    );
    console.log(`[GroupMessages API] ✅ REST API response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[GroupMessages API] ❌ Error sending message to group conversation ${conversationId}:`, error);
    throw error;
  } finally {
    console.groupEnd();
  }
};

// Create a new group conversation
export const createGroupConversation = async (name: string, participantIds: UserId[], description?: string): Promise<GroupConversation> => {
  try {
    const config = await getAuthHeaders();
    
    console.log(`[GroupMessages API] 📝 Creating group conversation: ${name}`);
    
    const response = await axios.post(
      `${API_URL}/messaging/groups/`,
      { 
        name, 
        participants: participantIds,
        description 
      },
      config
    );
    
    console.log(`[GroupMessages API] ✅ Created group conversation: ${name}`);
    
    // Fix return type for GroupConversation
    return response.data as GroupConversation;
  } catch (error) {
    console.error(`[GroupMessages API] ❌ Error creating group conversation: ${name}:`, error);
    throw error;
  }
};

// Update group conversation details
export const updateGroupConversation = async (
  conversationId: ConversationId, 
  updates: { name?: string; description?: string }
): Promise<GroupConversation> => {
  try {
    const config = await getAuthHeaders();
    
    console.log(`[GroupMessages API] ✏️ Updating group conversation ${conversationId}`);
    
    const response = await axios.patch(
      `${API_URL}/messaging/groups/${conversationId}/`,
      updates,
      config
    );
    
    console.log(`[GroupMessages API] ✅ Updated group conversation ${conversationId}`);
    
    return response.data as GroupConversation;
  } catch (error) {
    console.error(`[GroupMessages API] ❌ Error updating group conversation ${conversationId}:`, error);
    throw error;
  }
};

// Add participants to a group
export const addGroupParticipants = async (conversationId: ConversationId, participantIds: UserId[]): Promise<GroupConversation> => {
  try {
    const config = await getAuthHeaders();
    
    console.log(`[GroupMessages API] ➕ Adding participants to group ${conversationId}`);
    
    const response = await axios.post(
      `${API_URL}/messaging/groups/${conversationId}/add_participants/`,
      { participants: participantIds },
      config
    );
    
    console.log(`[GroupMessages API] ✅ Added participants to group ${conversationId}`);
    
    return response.data as GroupConversation;
  } catch (error) {
    console.error(`[GroupMessages API] ❌ Error adding participants to group ${conversationId}:`, error);
    throw error;
  }
};

// Remove participants from a group
export const removeGroupParticipants = async (conversationId: ConversationId, participantIds: UserId[]): Promise<GroupConversation> => {
  try {
    const config = await getAuthHeaders();
    
    console.log(`[GroupMessages API] ➖ Removing participants from group ${conversationId}`);
    
    const response = await axios.post(
      `${API_URL}/messaging/groups/${conversationId}/remove_participants/`,
      { participants: participantIds },
      config
    );
    
    console.log(`[GroupMessages API] ✅ Removed participants from group ${conversationId}`);
    
    return response.data as GroupConversation;
  } catch (error) {
    console.error(`[GroupMessages API] ❌ Error removing participants from group ${conversationId}:`, error);
    throw error;
  }
};

// Leave a group conversation
export const leaveGroupConversation = async (conversationId: ConversationId): Promise<void> => {
  try {
    const config = await getAuthHeaders();
    
    console.log(`[GroupMessages API] 🚪 Leaving group conversation ${conversationId}`);
    
    await axios.post(`${API_URL}/messaging/groups/${conversationId}/leave/`, {}, config);
    
    console.log(`[GroupMessages API] ✅ Left group conversation ${conversationId}`);
  } catch (error) {
    console.error(`[GroupMessages API] ❌ Error leaving group conversation ${conversationId}:`, error);
    throw error;
  }
};

// Delete a group conversation (admin only)
export const deleteGroupConversation = async (conversationId: ConversationId): Promise<void> => {
  try {
    const config = await getAuthHeaders();
    
    console.log(`[GroupMessages API] 🗑️ Deleting group conversation ${conversationId}`);
    
    await axios.delete(`${API_URL}/messaging/groups/${conversationId}/`, config);
    
    console.log(`[GroupMessages API] ✅ Deleted group conversation ${conversationId}`);
  } catch (error) {
    console.error(`[GroupMessages API] ❌ Error deleting group conversation ${conversationId}:`, error);
    throw error;
  }
};
