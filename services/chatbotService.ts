// services/chatbotService.ts
import { chatbotApi } from '../API/chatbot/chatbot';
import {
  ChatbotConversation,
  ChatbotConversationListItem,
  ChatMessage,
  ConversationListParams,
  MessagesParams,
  CreateConversationRequest,
  UpdateConversationRequest,
  SystemInfo,
} from '../types/chatbot/chatbot';

class ChatbotService {
  private static instance: ChatbotService;

  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  // Conversation management
  async getConversations(params?: ConversationListParams) {
    try {
      const response = await chatbotApi.getConversations(params);
      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch conversations',
      };
    }
  }

  async getConversation(id: number) {
    try {
      const conversation = await chatbotApi.getConversation(id);
      return {
        success: true,
        data: conversation,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch conversation',
      };
    }
  }

  async createConversation(data?: CreateConversationRequest) {
    try {
      const conversation = await chatbotApi.createConversation(data);
      return {
        success: true,
        data: conversation,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create conversation',
      };
    }
  }

  async updateConversation(id: number, data: UpdateConversationRequest) {
    try {
      const conversation = await chatbotApi.updateConversation(id, data);
      return {
        success: true,
        data: conversation,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update conversation',
      };
    }
  }

  async deleteConversation(id: number) {
    try {
      await chatbotApi.deleteConversation(id);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete conversation',
      };
    }
  }

  async toggleConversationActive(id: number, isActive?: boolean) {
    try {
      const response = await chatbotApi.toggleConversationActive(id, isActive);
      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to toggle conversation status',
      };
    }
  }

  async clearConversation(id: number) {
    try {
      const response = await chatbotApi.clearConversation(id);
      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to clear conversation',
      };
    }
  }

  // Message management
  async getMessages(conversationId: number, params?: MessagesParams) {
    try {
      const response = await chatbotApi.getMessages(conversationId, params);
      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch messages',
      };
    }
  }

  async sendMessage(conversationId: number, content: string) {
    try {
      const response = await chatbotApi.sendMessage(conversationId, content);
      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send message',
      };
    }
  }

  // System information
  async getSystemInfo() {
    try {
      const systemInfo = await chatbotApi.getSystemInfo();
      return {
        success: true,
        data: systemInfo,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch system info',
      };
    }
  }

  // Utility methods
  formatMessage(message: ChatMessage): string {
    const timestamp = new Date(message.timestamp).toLocaleString();
    const sender = message.is_bot ? 'Bot' : message.sender_name;
    return `[${timestamp}] ${sender}: ${message.content}`;
  }

  formatConversationTitle(conversation: ChatbotConversation | ChatbotConversationListItem): string {
    const messageCount = conversation.message_count;
    const status = conversation.is_active ? 'Active' : 'Archived';
    return `${conversation.title} (${messageCount} messages, ${status})`;
  }

  isConversationEmpty(conversation: ChatbotConversation | ChatbotConversationListItem): boolean {
    return conversation.message_count === 0;
  }

  getConversationLastActivity(conversation: ChatbotConversation | ChatbotConversationListItem): Date {
    return new Date(conversation.last_activity);
  }

  // Search and filter utilities
  filterConversationsByTitle(
    conversations: (ChatbotConversation | ChatbotConversationListItem)[],
    searchTerm: string
  ): (ChatbotConversation | ChatbotConversationListItem)[] {
    if (!searchTerm.trim()) return conversations;
    
    const term = searchTerm.toLowerCase();
    return conversations.filter(conv =>
      conv.title.toLowerCase().includes(term)
    );
  }

  sortConversationsByActivity(
    conversations: (ChatbotConversation | ChatbotConversationListItem)[],
    ascending: boolean = false
  ): (ChatbotConversation | ChatbotConversationListItem)[] {
    return [...conversations].sort((a, b) => {
      const dateA = new Date(a.last_activity).getTime();
      const dateB = new Date(b.last_activity).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  groupConversationsByDate(
    conversations: (ChatbotConversation | ChatbotConversationListItem)[]
  ): { [key: string]: (ChatbotConversation | ChatbotConversationListItem)[] } {
    const groups: { [key: string]: (ChatbotConversation | ChatbotConversationListItem)[] } = {};
    
    conversations.forEach(conv => {
      const date = new Date(conv.last_activity);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString();
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(conv);
    });
    
    return groups;
  }

  // Message utilities
  getMessagesBySender(messages: ChatMessage[], isBot: boolean): ChatMessage[] {
    return messages.filter(msg => msg.is_bot === isBot);
  }

  getMessagesInTimeRange(
    messages: ChatMessage[],
    startTime: Date,
    endTime: Date
  ): ChatMessage[] {
    return messages.filter(msg => {
      const msgTime = new Date(msg.timestamp);
      return msgTime >= startTime && msgTime <= endTime;
    });
  }

  getConversationStats(conversation: ChatbotConversation) {
    const messages = conversation.recent_messages || [];
    const userMessages = this.getMessagesBySender(messages, false);
    const botMessages = this.getMessagesBySender(messages, true);
    
    return {
      totalMessages: conversation.message_count,
      userMessages: userMessages.length,
      botMessages: botMessages.length,
      lastActivity: this.getConversationLastActivity(conversation),
      isActive: conversation.is_active,
    };
  }
}

// Export singleton instance
export const chatbotService = ChatbotService.getInstance();
export default chatbotService;
