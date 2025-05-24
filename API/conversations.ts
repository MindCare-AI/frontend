import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import websocketService from '../services/websocketService';

// Types for the API functions
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

interface ConversationData {
  id: string | number;
  is_group?: boolean;
  participants?: any[];
  last_message?: {
    content?: string;
    timestamp?: string;
    sender_name?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at?: string;
  name?: string;
  other_user_name?: string;
  other_participant?: {
    id: number;
    username?: string;
    full_name?: string;
  };
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

// Get all conversations for the current user
export const getConversations = async (pagination?: Pagination) => {
  try {
    const config = await getAuthHeaders();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    console.log(`[API] 📋 Fetching conversations${queryString ? ` with params: ${queryString}` : ''}`);
    
    // Fetch both one-to-one and group conversations
    const [oneToOneResponse, groupResponse] = await Promise.all([
      axios.get<ApiResponse<ConversationData>>(`${API_URL}/messaging/one_to_one/${queryString}`, config),
      axios.get<ApiResponse<ConversationData>>(`${API_URL}/messaging/groups/${queryString}`, config)
    ]);
    
    console.log(`[API] ✅ Fetched conversations:`, {
      oneToOne: oneToOneResponse.data?.results?.length || 0,
      groups: groupResponse.data?.results?.length || 0
    });
    
    // Helper function to transform last_message to expected format
    const transformLastMessage = (lastMessage: any) => {
      if (!lastMessage) return undefined;
      
      return {
        content: lastMessage.content || '',
        timestamp: lastMessage.timestamp || new Date().toISOString(),
        sender_name: lastMessage.sender_name || lastMessage.sender?.username || 'Unknown'
      };
    };
    
    // Combine and format conversations
    const oneToOneConversations = (oneToOneResponse.data?.results || []).map((conv: ConversationData) => ({
      ...conv,
      is_group: false,
      created_at: conv.created_at || new Date().toISOString(),
      updated_at: conv.updated_at || conv.created_at || new Date().toISOString(),
      participants: conv.participants || [], // Ensure participants is always an array
      last_message: transformLastMessage(conv.last_message)
    }));
    
    const groupConversations = (groupResponse.data?.results || []).map((conv: ConversationData) => ({
      ...conv,
      is_group: true,
      created_at: conv.created_at || new Date().toISOString(),
      updated_at: conv.updated_at || conv.created_at || new Date().toISOString(),
      participants: conv.participants || [], // Ensure participants is always an array
      last_message: transformLastMessage(conv.last_message)
    }));
    
    // Merge all conversations and sort by last message timestamp
    const allConversations = [...oneToOneConversations, ...groupConversations];
    const sortedConversations = allConversations.sort((a, b) => {
      const aTime = a.last_message?.timestamp ? new Date(a.last_message.timestamp).getTime() : 0;
      const bTime = b.last_message?.timestamp ? new Date(b.last_message.timestamp).getTime() : 0;
      return bTime - aTime; // Most recent first
    });
    
    return {
      results: sortedConversations,
      count: sortedConversations.length,
      next: null, // Implement pagination if needed
      previous: null
    };
    
  } catch (error) {
    console.error('[API] ❌ Error fetching conversations:', error);
    throw error;
  }
};

// Get messages for a conversation
export const getMessages = async (conversationId: ConversationId) => {
  try {
    const config = await getAuthHeaders();
    
    // First determine if it's a group or one-to-one conversation
    const isGroup = await isGroupType(conversationId);
    
    const endpoint = isGroup 
      ? `${API_URL}/messaging/groups/${conversationId}/messages/`
      : `${API_URL}/messaging/one_to_one/${conversationId}/messages/`;
    
    console.log(`[API] 📋 Fetching messages from: ${endpoint}`);
    
    const response = await axios.get<ApiResponse<any>>(endpoint, config);
    
    console.log(`[API] ✅ Fetched ${response.data?.results?.length || 0} messages`);
    
    return response.data || { results: [] };
    
  } catch (error) {
    console.error('[API] ❌ Error fetching messages:', error);
    // Return empty results instead of throwing to prevent app crashes
    return { results: [] };
  }
};

// Send a message (handles both one-to-one and group)
export const sendMessage = async (
  conversationId: ConversationId, 
  content: string, 
  isGroup: boolean = false, 
  attachments: any[] = []
) => {
  console.group(`[API] 📤 sendMessage called for conversation: ${conversationId}`);

  try {
    // Get current WS status
    let isWebSocketConnected = websocketService.isConnected();
    let currentConversationId = websocketService.getCurrentConversationId();
    let isCorrectConversation = currentConversationId === conversationId.toString();

    console.log(`[API] 🔍 WebSocket Status Check:`);
    console.log(`  • Connected: ${isWebSocketConnected}`);
    console.log(`  • Current conversation: ${currentConversationId}`);
    console.log(`  • Target conversation: ${conversationId}`);
    console.log(`  • Match: ${isCorrectConversation}`);

    // If not connected or wrong convo, try a quick reconnect
    if (!isWebSocketConnected || !isCorrectConversation) {
      console.log(`[API] 🔄 Attempting WebSocket connect for conversation ${conversationId}`);
      try {
        await websocketService.connect(conversationId.toString());
      } catch (connErr) {
        console.warn(`[API] ⚠️ WebSocket reconnection failed:`, connErr);
      }
      isWebSocketConnected = websocketService.isConnected();
      isCorrectConversation = websocketService.getCurrentConversationId() === conversationId.toString();
    }

    // Now send via WS if it’s up and on the right convo
    if (isWebSocketConnected && isCorrectConversation) {
      console.log(`[API] 🌐 Sending via WebSocket…`);
      websocketService.sendMessage({
        content,
        message_type: 'text',
        metadata: { source: 'API_wrapper' },
        ...(attachments.length > 0 && { media_id: attachments[0]?.id })
      });
      console.log(`[API] ✅ Message sent via WebSocket`);
      return {
        id: `temp-${Date.now()}`,
        content,
        conversation: conversationId,
        message_type: 'text',
        timestamp: new Date().toISOString(),
        status: 'sending',
        via: 'websocket'
      };
    }

    console.log(`[API] 📍 WebSocket not available, using REST API`);
    const config = await getAuthHeaders();
    const isGroupConversation = isGroup || await isGroupType(conversationId);

    const endpoint = isGroupConversation
      ? `${API_URL}/messaging/groups/messages/`
      : `${API_URL}/messaging/one_to_one/messages/`;

    console.log(`[API] 📍 Using endpoint: ${endpoint}`);
    console.log(`[API] 📦 Conversation type: ${isGroupConversation ? 'group' : 'one-to-one'}`);
      
    const payload = {
      content,
      conversation: conversationId,
      message_type: 'text',
      attachments: attachments || [],
    };
    
    console.log(`[API] 📤 Sending payload:`, payload);
      
    const response = await axios.post(endpoint, payload, config);
    
    console.log(`[API] ✅ REST API response received:`, response.data);
    console.log(`[API] 📊 Response status: ${response.status}`);
    
    return {
      ...(typeof response.data === 'object' && response.data !== null ? response.data : {}),
      via: 'rest_api'
    };
    
  } catch (error) {
    console.error('[API] ❌ Error sending message:', error);
    console.error('[API] 📋 Error details:', {
      conversationId,
      content: content.substring(0, 50),
      isGroup,
      attachments: attachments.length
    });
    throw error;
  } finally {
    console.groupEnd();
  }
};

// Send typing indicator
export const sendTypingIndicator = async (conversationId: ConversationId, isTyping: boolean) => {
  console.log(`[API] ⌨️ sendTypingIndicator: ${isTyping ? 'started' : 'stopped'} for conversation ${conversationId}`);
  
  try {
    // Use WebSocket if connected
    if (websocketService.isConnected() && 
        websocketService.getCurrentConversationId() === conversationId.toString()) {
      console.log(`[API] 🌐 Sending typing indicator via WebSocket`);
      websocketService.sendTyping(isTyping);
      return;
    }

    console.log(`[API] 🌐 Sending typing indicator via REST API`);
    // Fallback to REST API
    const config = await getAuthHeaders();
    await axios.post(
      `${API_URL}/messaging/one_to_one/${conversationId}/typing/`,
      {},
      config
    );
    console.log(`[API] ✅ Typing indicator sent via REST API`);
  } catch (error) {
    console.error('[API] ❌ Error sending typing indicator:', error);
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string) => {
  console.log(`[API] 👁️ markMessageAsRead: ${messageId}`);
  
  try {
    // Use WebSocket if connected
    if (websocketService.isConnected()) {
      console.log(`[API] 🌐 Sending read receipt via WebSocket`);
      websocketService.sendReadReceipt(messageId);
      return;
    }

    console.log(`[API] ⚠️ WebSocket not connected, read receipt not sent`);
    // Note: REST API endpoint for read receipts would need to be implemented
  } catch (error) {
    console.error('[API] ❌ Error marking message as read:', error);
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

// Get all users for conversation creation
export const getAllUsers = async () => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/users/list-all/`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Create a new one-to-one conversation
export const createConversation = async (participantId: UserId): Promise<{
  id: string | number;
  is_group: boolean;
  participants: any[];
  created_at: string;
  other_user_name?: string;
}> => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/messaging/one_to_one/`,
      { participant_id: participantId },
      config
    );
    
    // Ensure response.data is properly typed
    const data = response.data as {
      id: string | number;
      is_group?: boolean;
      participants?: any[];
      created_at: string;
      other_user_name?: string;
    };
    
    return {
      id: data.id,
      is_group: data.is_group || false,
      participants: data.participants || [],
      created_at: data.created_at,
      other_user_name: data.other_user_name,
    };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Create a new group conversation
export const createGroupConversation = async (
  name: string,
  description: string,
  participants: Array<UserId>
): Promise<{
  id: string | number;
  name: string;
  description: string;
  is_group: boolean;
  participants: any[];
  created_at: string;
}> => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/messaging/groups/`,
      {
        name,
        description,
        participants,
      },
      config
    );
    
    // Ensure response.data is properly typed
    const data = response.data as {
      id: string | number;
      name: string;
      description: string;
      is_group?: boolean;
      participants?: any[];
      created_at: string;
    };
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      is_group: data.is_group || true,
      participants: data.participants || [],
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('Error creating group conversation:', error);
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
