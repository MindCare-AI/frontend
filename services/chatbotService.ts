import { Message, MessageRequest, ChatbotConversation } from '../types/chat';
import { API_URL } from '../config';
import chatService from './chatService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class ChatbotService {
  private currentConversation: ChatbotConversation | null = null;
  private messageQueue: MessageRequest[] = [];
  private isProcessing = false;

  async initializeConversation(): Promise<ChatbotConversation> {
    try {
      const response = await fetch(`${API_URL}/messaging/chatbot/conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initialize chatbot conversation');
      }

      const conversation = await response.json();
      this.currentConversation = conversation;
      return conversation;
    } catch (error) {
      console.error('Error initializing chatbot conversation:', error);
      throw error;
    }
  }

  async sendMessage(content: string): Promise<Message> {
    if (!this.currentConversation) {
      await this.initializeConversation();
    }

    const messageRequest: MessageRequest = {
      content,
      conversation_id: this.currentConversation!.id,
      message_type: 'text',
    };

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        // Queue message for later if offline
        this.messageQueue.push(messageRequest);
        throw new Error('No internet connection');
      }

      const response = await fetch(`${API_URL}/messaging/chatbot/${this.currentConversation!.id}/send_message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to send message to chatbot');
      }

      const message = await response.json();

      // Notify the main chat service about the new message
      chatService.handleNewMessage(message);

      return message;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  }

  async processQueue() {
    if (this.isProcessing || this.messageQueue.length === 0) return;

    this.isProcessing = true;

    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        this.isProcessing = false;
        return;
      }

      while (this.messageQueue.length > 0) {
        const messageRequest = this.messageQueue[0];
        try {
          await this.sendMessage(messageRequest.content);
          this.messageQueue.shift(); // Remove processed message
        } catch (error) {
          console.error('Error processing queued message:', error);
          break; // Stop processing on error
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async getChatHistory(conversationId: string): Promise<Message[]> {
    try {
      const response = await fetch(`${API_URL}/messaging/chatbot/${conversationId}/history`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const { messages } = await response.json();
      return messages;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  async clearHistory(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/messaging/chatbot/${conversationId}/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear chat history');
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }

  setCurrentConversation(conversation: ChatbotConversation) {
    this.currentConversation = conversation;
  }

  getCurrentConversation(): ChatbotConversation | null {
    return this.currentConversation;
  }

  // Setup network change listener to process queue when connection is restored
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.processQueue();
      }
    });
  }
}

export const chatbotService = new ChatbotService();
chatbotService.setupNetworkListener();
export default chatbotService;