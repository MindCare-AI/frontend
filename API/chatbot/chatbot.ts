// API/chatbot/chatbot.ts
import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChatbotConversation,
  ChatbotConversationListItem,
  ChatMessage,
  MessagesResponse,
  SendMessageResponse,
  SendMessageRequest,
  CreateConversationRequest,
  UpdateConversationRequest,
  ToggleActiveRequest,
  SystemInfo,
  PaginatedResponse,
  ConversationListParams,
  MessagesParams,
} from '../../types/chatbot/chatbot';

const CHATBOT_API_BASE = `${API_URL}/chatbot`;

// Create axios instance with authentication
const createApiClient = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  console.log('[ChatbotAPI] Creating API client with baseURL:', CHATBOT_API_BASE);
  console.log('[ChatbotAPI] API_URL:', API_URL);
  return axios.create({
    baseURL: CHATBOT_API_BASE,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

export const chatbotApi = {
  // Conversation management
  async getConversations(
    params?: ConversationListParams
  ): Promise<PaginatedResponse<ChatbotConversationListItem | ChatbotConversation>> {
    const client = await createApiClient();
    const response = await client.get('/', { params });
    return response.data as PaginatedResponse<ChatbotConversationListItem | ChatbotConversation>;
  },

  async getConversation(id: number): Promise<ChatbotConversation> {
    const client = await createApiClient();
    console.log('[ChatbotAPI] Getting conversation:', id);
    const response = await client.get(`/${id}/`);
    console.log('[ChatbotAPI] Get conversation response:', response.data);
    return response.data as ChatbotConversation;
  },

  async createConversation(data?: CreateConversationRequest): Promise<ChatbotConversation> {
    const client = await createApiClient();
    const requestData = data || { title: "New Conversation" };
    console.log('[ChatbotAPI] Creating conversation with data:', requestData);
    try {
      const response = await client.post('/', requestData);
      console.log('[ChatbotAPI] Create conversation response:', response.data);
      return response.data as ChatbotConversation;
    } catch (error: any) {
      console.error('[ChatbotAPI] Create conversation error:', error.response?.data || error.message);
      throw error;
    }
  },

  async updateConversation(
    id: number,
    data: UpdateConversationRequest
  ): Promise<ChatbotConversation> {
    const client = await createApiClient();
    const response = await client.patch(`/${id}/`, data);
    return response.data as ChatbotConversation;
  },

  async deleteConversation(id: number): Promise<void> {
    const client = await createApiClient();
    await client.delete(`/${id}/`);
  },

  async toggleConversationActive(
    id: number,
    isActive?: boolean
  ): Promise<{ message: string; conversation: ChatbotConversation }> {
    const client = await createApiClient();
    const data: ToggleActiveRequest = isActive !== undefined ? { is_active: isActive } : {};
    const response = await client.post(`/${id}/toggle_active/`, data);
    return response.data as { message: string; conversation: ChatbotConversation };
  },

  async clearConversation(id: number): Promise<{ 
    message: string; 
    conversation_id: number; 
    messages_deleted: number 
  }> {
    const client = await createApiClient();
    const response = await client.post(`/${id}/clear/`);
    return response.data as { message: string; conversation_id: number; messages_deleted: number };
  },

  // Message management
  async getMessages(conversationId: number, params?: MessagesParams): Promise<MessagesResponse> {
    const client = await createApiClient();
    const response = await client.get(`/${conversationId}/messages/`, {
      params,
    });
    return response.data as MessagesResponse;
  },

  async sendMessage(
    conversationId: number,
    content: string
  ): Promise<SendMessageResponse> {
    const client = await createApiClient();
    const data: SendMessageRequest = { content };
    const url = `/${conversationId}/send_message/`;
    console.log('[ChatbotAPI] Making sendMessage request to:', url);
    console.log('[ChatbotAPI] Full URL will be:', `${CHATBOT_API_BASE}${url}`);
    console.log('[ChatbotAPI] Request data:', data);
    try {
      const response = await client.post(url, data);
      console.log('[ChatbotAPI] sendMessage response:', response.data);
      return response.data as SendMessageResponse;
    } catch (error: any) {
      console.error('[ChatbotAPI] sendMessage error:', error.response?.data || error.message);
      throw error;
    }
  },

  // System information
  async getSystemInfo(): Promise<SystemInfo> {
    const client = await createApiClient();
    const response = await client.get('/system-info/');
    return response.data as SystemInfo;
  },
};

export default chatbotApi;