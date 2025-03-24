import { API_URL } from '../config';

interface FetchOptions {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
}

export default class ConversationService {
  static async fetchOneToOneConversations(token: string, options: FetchOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    
    try {
      const response = await fetch(
        `${API_URL}/messaging/one_to_one/?page=${page}&page_size=${pageSize}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching one-to-one conversations:', error);
      throw error;
    }
  }
  
  static async fetchGroupConversations(token: string, options: FetchOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    
    try {
      const response = await fetch(
        `${API_URL}/messaging/groups/?page=${page}&page_size=${pageSize}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching group conversations:', error);
      throw error;
    }
  }
  
  static async fetchMessages(
    token: string, 
    conversationType: 'one_to_one' | 'group',
    conversationId: number | string,
    options: FetchOptions = {}
  ) {
    const { page = 1, pageSize = 20 } = options;
    
    const endpoint = conversationType === 'one_to_one'
      ? `${API_URL}/messaging/one_to_one/messages/?conversation=${conversationId}&page=${page}&page_size=${pageSize}`
      : `${API_URL}/messaging/groups/messages/?conversation=${conversationId}&page=${page}&page_size=${pageSize}`;
      
    try {
      const response = await fetch(endpoint, {
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
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
  
  static async sendMessage(
    token: string,
    conversationType: 'one_to_one' | 'group',
    conversationId: number | string,
    content: string,
    messageType: string = 'text'
  ) {
    const endpoint = conversationType === 'one_to_one'
      ? `${API_URL}/messaging/one_to_one/messages/`
      : `${API_URL}/messaging/groups/messages/`;
      
    try {
      const response = await fetch(endpoint, {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  static async createOneToOneConversation(token: string, otherUserId: number) {
    try {
      const response = await fetch(`${API_URL}/messaging/one_to_one/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: [otherUserId]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating one-to-one conversation:', error);
      throw error;
    }
  }
  
  static async createGroupConversation(
    token: string, 
    name: string, 
    participants: number[],
    description: string = '',
    isPrivate: boolean = false
  ) {
    try {
      const response = await fetch(`${API_URL}/messaging/groups/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          participants,
          is_private: isPrivate
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating group conversation:', error);
      throw error;
    }
  }
  
  static async sendTypingStatus(token: string, conversationId: number | string) {
    try {
      const response = await fetch(`${API_URL}/messaging/one_to_one/${conversationId}/typing/`, {
        method: 'POST',
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
      console.error('Error sending typing status:', error);
      throw error;
    }
  }
  
  static async searchMessages(
    token: string, 
    conversationId: number | string, 
    query: string
  ) {
    try {
      const response = await fetch(
        `${API_URL}/messaging/one_to_one/${conversationId}/search/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }
}