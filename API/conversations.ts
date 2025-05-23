import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import websocketService from '../services/websocketService';

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
