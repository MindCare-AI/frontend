// services/ConversationService.ts
import { API_URL } from '../config';
import { retryFetch } from '../utils/retryFetch';
import { Message, Conversation, OneToOneConversation, GroupConversation } from '../types/messaging';

export default class ConversationService {
  static async fetchConversations(
    token: string,
    type: 'one_to_one' | 'group',
    page: number = 1,
    pageSize: number = 20
  ): Promise<Conversation[]> {
    const endpoint = `${API_URL}/messaging/${type === 'one_to_one' ? 'one_to_one' : 'groups'}/?page=${page}&page_size=${pageSize}`;

    try {
      const response = await retryFetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error(`Failed to fetch ${type} conversations:`, error);
      throw error;
    }
  }

  static async fetchMessages(
    token: string,
    conversationId: string | number,
    type: 'one_to_one' | 'group',
    page: number = 1,
    pageSize: number = 20
  ): Promise<Message[]> {
    const endpoint = `${API_URL}/messaging/${type === 'one_to_one' ? 'one_to_one' : 'groups'}/${conversationId}/messages/?page=${page}&page_size=${pageSize}`;

    try {
      const response = await retryFetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error(`Failed to fetch messages for ${type} conversation ${conversationId}:`, error);
      throw error;
    }
  }

  static async sendMessage(
    token: string,
    content: string,
    conversationId: string | number,
    type: 'one_to_one' | 'group',
    messageType: string = 'text'
  ): Promise<Message> {
    const endpoint = `${API_URL}/messaging/${type === 'one_to_one' ? 'one_to_one' : 'groups'}/messages/`;

    try {
      const response = await retryFetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          conversation: conversationId,
          message_type: messageType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to send message: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  static async createOneToOneConversation(
    token: string,
    participantId: number
  ): Promise<OneToOneConversation> {
    const response = await retryFetch(`${API_URL}/api/v1/messaging/one_to_one/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participant_id: participantId, // Match the backend expectation
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create conversation');
    }

    return await response.json();
  }

  static async createGroupConversation(
    token: string,
    name: string,
    participantIds: number[],
    description: string = '',
    isPrivate: boolean = true
  ): Promise<GroupConversation> {
    const endpoint = `${API_URL}/messaging/groups/`;

    try {
      const response = await retryFetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          participants: participantIds,
          is_private: isPrivate
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create group conversation:', error);
      throw error;
    }
  }

  static async markAsRead(
    token: string,
    conversationId: string | number,
    type: 'one_to_one' | 'group'
  ): Promise<void> {
    const endpoint = `${API_URL}/messaging/${type === 'one_to_one' ? 'one_to_one' : 'groups'}/${conversationId}/`;

    try {
      const response = await retryFetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
      throw error;
    }
  }

  static async searchMessages(
    token: string,
    conversationId: string | number,
    type: 'one_to_one' | 'group',
    query: string
  ): Promise<Message[]> {
    const endpoint = `${API_URL}/messaging/${type === 'one_to_one' ? 'one_to_one' : 'groups'}/${conversationId}/search/?q=${encodeURIComponent(query)}`;

    try {
      const response = await retryFetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to search messages:', error);
      throw error;
    }
  }
}