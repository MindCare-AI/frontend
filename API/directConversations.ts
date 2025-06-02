import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import websocketService from '../services/websocketService';

// Types for Direct Conversations API
type ConversationId = string | number;
type UserId = string | number;
type Pagination = { page?: number; limit?: number };

// Direct Conversation Types
export interface DirectMessage {
  id: string | number;
  content: string;
  message_type: 'text' | 'image' | 'file';
  sender: number;
  sender_name: string;
  timestamp: string;
  is_read: boolean;
  conversation: ConversationId;
}

export interface DirectConversation {
  id: ConversationId;
  participants: number[];
  other_participant: {
    id: number;
    username: string;
    full_name?: string;
    profile_pic?: string;
  };
  other_user_name: string;
  last_message?: DirectMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface DirectConversationResponse {
  results: DirectConversation[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

// Get auth headers
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
    console.error('[DirectConversationsAPI] Error getting auth token:', error);
    throw error;
  }
};

// Get all direct conversations
export const getDirectConversations = async (pagination?: Pagination): Promise<DirectConversationResponse> => {
  try {
    const config = await getAuthHeaders();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    console.log(`[DirectConversationsAPI] 📋 Fetching direct conversations${queryString ? ` with params: ${queryString}` : ''}`);
    
    const response = await axios.get<DirectConversationResponse>(
      `${API_URL}/messaging/one_to_one/${queryString}`, 
      config
    );
    
    console.log(`[DirectConversationsAPI] ✅ Fetched ${response.data?.results?.length || 0} direct conversations`);
    
    return response.data || { results: [], count: 0 };
    
  } catch (error) {
    console.error('[DirectConversationsAPI] ❌ Error fetching direct conversations:', error);
    throw error;
  }
};

// Get direct conversation by ID
export const getDirectConversationById = async (conversationId: ConversationId): Promise<DirectConversation> => {
  try {
    const config = await getAuthHeaders();
    console.log(`[DirectConversationsAPI] 📋 Fetching direct conversation: ${conversationId}`);
    
    const response = await axios.get<DirectConversation>(
      `${API_URL}/messaging/one_to_one/${conversationId}/`, 
      config
    );
    
    console.log(`[DirectConversationsAPI] ✅ Fetched direct conversation: ${conversationId}`);
    
    return response.data;
    
  } catch (error) {
    console.error(`[DirectConversationsAPI] ❌ Error fetching direct conversation ${conversationId}:`, error);
    throw error;
  }
};

// Get messages for a direct conversation
export const getDirectMessages = async (conversationId: ConversationId): Promise<{ results: DirectMessage[] }> => {
  try {
    const config = await getAuthHeaders();
    
    console.log(`[DirectConversationsAPI] 📋 Fetching messages for direct conversation: ${conversationId}`);
    
    const response = await axios.get<{ results: DirectMessage[] }>(
      `${API_URL}/messaging/one_to_one/${conversationId}/messages/`, 
      config
    );
    
    console.log(`[DirectConversationsAPI] ✅ Fetched ${response.data?.results?.length || 0} messages`);
    
    return response.data || { results: [] };
    
  } catch (error) {
    console.error(`[DirectConversationsAPI] ❌ Error fetching direct messages for ${conversationId}:`, error);
    return { results: [] };
  }
};

// Send message to direct conversation
export const sendDirectMessage = async (
  conversationId: ConversationId,
  content: string,
  attachments: any[] = []
): Promise<DirectMessage> => {
  console.group(`[DirectConversationsAPI] 📤 sendDirectMessage called for conversation: ${conversationId}`);

  try {
    // Try WebSocket first if connected to this conversation
    const isWebSocketConnected = websocketService.isConnected();
    const currentConversationId = websocketService.getCurrentConversationId();
    const isCorrectConversation = currentConversationId === conversationId.toString();

    console.log(`[DirectConversationsAPI] 🔍 WebSocket Status Check:`);
    console.log(`  • Connected: ${isWebSocketConnected}`);
    console.log(`  • Current conversation: ${currentConversationId}`);
    console.log(`  • Target conversation: ${conversationId}`);
    console.log(`  • Match: ${isCorrectConversation}`);

    if (isWebSocketConnected && isCorrectConversation) {
      console.log(`[DirectConversationsAPI] 🌐 Sending via WebSocket`);
      websocketService.sendMessage({
        content,
        message_type: 'text',
        metadata: { source: 'DirectConversationsAPI' },
        ...(attachments.length > 0 && { media_id: attachments[0]?.id })
      });
      
      // Return a temporary message object for immediate UI update
      return {
        id: `temp-${Date.now()}`,
        content,
        conversation: conversationId,
        message_type: 'text',
        sender: 0, // Will be updated when real message comes back via WebSocket
        sender_name: 'You',
        timestamp: new Date().toISOString(),
        is_read: false
      };
    }

    console.log(`[DirectConversationsAPI] 📍 Using REST API`);
    const config = await getAuthHeaders();
    
    const payload = {
      content,
      conversation: conversationId,
      message_type: 'text',
      attachments: attachments || [],
    };
    
    console.log(`[DirectConversationsAPI] 📤 Sending payload:`, payload);
    
    const response = await axios.post<DirectMessage>(
      `${API_URL}/messaging/one_to_one/messages/`,
      payload,
      config
    );
    
    console.log(`[DirectConversationsAPI] ✅ REST API response received:`, response.data);
    
    return response.data;
    
  } catch (error) {
    console.error(`[DirectConversationsAPI] ❌ Error sending direct message:`, error);
    throw error;
  } finally {
    console.groupEnd();
  }
};

// Create a new direct conversation
export const createDirectConversation = async (participantId: UserId): Promise<DirectConversation> => {
  try {
    const config = await getAuthHeaders();
    console.log(`[DirectConversationsAPI] 🆕 Creating direct conversation with user: ${participantId}`);
    
    const response = await axios.post<DirectConversation>(
      `${API_URL}/messaging/one_to_one/`,
      { participant_id: participantId },
      config
    );
    
    console.log(`[DirectConversationsAPI] ✅ Direct conversation created:`, response.data);
    
    return response.data;
  } catch (error) {
    console.error('[DirectConversationsAPI] ❌ Error creating direct conversation:', error);
    throw error;
  }
};

// Delete a direct conversation
export const deleteDirectConversation = async (conversationId: ConversationId): Promise<void> => {
  try {
    console.log(`[DirectConversationsAPI] 🗑️ Deleting direct conversation: ${conversationId}`);
    const config = await getAuthHeaders();
    
    const response = await axios.delete(
      `${API_URL}/messaging/one_to_one/${conversationId}/`,
      config
    );
    
    if (response.status === 200 || response.status === 204) {
      console.log(`[DirectConversationsAPI] ✅ Direct conversation ${conversationId} deleted successfully`);
    } else {
      throw new Error(`Failed to delete direct conversation: ${response.status}`);
    }
  } catch (error) {
    console.error('[DirectConversationsAPI] ❌ Error deleting direct conversation:', error);
    throw error;
  }
};

// Send typing indicator for direct conversation
export const sendDirectTypingIndicator = async (conversationId: ConversationId, isTyping: boolean): Promise<void> => {
  console.log(`[DirectConversationsAPI] ⌨️ sendDirectTypingIndicator: ${isTyping ? 'started' : 'stopped'} for conversation ${conversationId}`);
  
  try {
    // Use WebSocket if connected to this conversation
    if (websocketService.isConnected() && 
        websocketService.getCurrentConversationId() === conversationId.toString()) {
      console.log(`[DirectConversationsAPI] 🌐 Sending typing indicator via WebSocket`);
      websocketService.sendTyping(isTyping);
      return;
    }

    console.log(`[DirectConversationsAPI] 🌐 Sending typing indicator via REST API`);
    const config = await getAuthHeaders();
    await axios.post(
      `${API_URL}/messaging/one_to_one/${conversationId}/typing/`,
      { is_typing: isTyping },
      config
    );
    console.log(`[DirectConversationsAPI] ✅ Typing indicator sent via REST API`);
  } catch (error) {
    console.error('[DirectConversationsAPI] ❌ Error sending typing indicator:', error);
  }
};

// Mark direct message as read
export const markDirectMessageAsRead = async (messageId: string): Promise<void> => {
  console.log(`[DirectConversationsAPI] 👁️ markDirectMessageAsRead: ${messageId}`);
  
  try {
    // Use WebSocket if connected
    if (websocketService.isConnected()) {
      console.log(`[DirectConversationsAPI] 🌐 Sending read receipt via WebSocket`);
      websocketService.sendReadReceipt(messageId);
      return;
    }

    console.log(`[DirectConversationsAPI] ⚠️ WebSocket not connected, read receipt not sent`);
    // Note: REST API endpoint for read receipts would need to be implemented
  } catch (error) {
    console.error('[DirectConversationsAPI] ❌ Error marking direct message as read:', error);
  }
};
