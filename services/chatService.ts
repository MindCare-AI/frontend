import AsyncStorage from '@react-native-async-storage/async-storage';
import chatWebSocket, { WebSocketEvent } from './websocket';
import messageQueue from './messageQueue';
import { API_URL } from '../config';
import { Message, TypingIndicator, ReadReceipt } from '../types/chat';

class ChatService {
  private static instance: ChatService;
  private messageListeners: ((message: Message) => void)[] = [];
  private typingListeners: ((indicator: TypingIndicator) => void)[] = [];
  private readReceiptListeners: ((receipt: ReadReceipt) => void)[] = [];
  private isInitialized = false;

  private constructor() {
    this.setupWebSocketListeners();
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private setupWebSocketListeners() {
    chatWebSocket.on(WebSocketEvent.MESSAGE, (message: Message) => {
      this.messageListeners.forEach(listener => listener(message));
    });

    chatWebSocket.on(WebSocketEvent.TYPING, (indicator: TypingIndicator) => {
      this.typingListeners.forEach(listener => listener(indicator));
    });

    chatWebSocket.on(WebSocketEvent.READ_RECEIPT, (receipt: ReadReceipt) => {
      this.readReceiptListeners.forEach(listener => listener(receipt));
    });
  }

  async initialize(token: string) {
    if (this.isInitialized) return;

    chatWebSocket.connect(token);
    this.isInitialized = true;
  }

  async sendMessage(message: Partial<Message>): Promise<string> {
    // Add to queue first to ensure delivery
    const queueId = await messageQueue.enqueue(message);

    return queueId;
  }

  async fetchMessages(conversationId: string, before?: string, limit = 20): Promise<Message[]> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(
        `${API_URL}/conversations/${conversationId}/messages?${
          before ? `before=${before}&` : ''
        }limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const messages: Message[] = await response.json();
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string, conversationId: string) {
    chatWebSocket.sendReadReceipt(messageId, conversationId);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      await fetch(`${API_URL}/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  sendTypingIndicator(isTyping: boolean, conversationId: string) {
    chatWebSocket.sendTypingIndicator(isTyping, conversationId);
  }

  async addReaction(messageId: string, reaction: string) {
    chatWebSocket.sendReaction(messageId, reaction);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      await fetch(`${API_URL}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reaction }),
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }

  async removeReaction(messageId: string, reaction: string) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await fetch(`${API_URL}/messages/${messageId}/reactions/${reaction}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  }

  onMessage(listener: (message: Message) => void) {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  onTypingIndicator(listener: (indicator: TypingIndicator) => void) {
    this.typingListeners.push(listener);
    return () => {
      this.typingListeners = this.typingListeners.filter(l => l !== listener);
    };
  }

  onReadReceipt(listener: (receipt: ReadReceipt) => void) {
    this.readReceiptListeners.push(listener);
    return () => {
      this.readReceiptListeners = this.readReceiptListeners.filter(l => l !== listener);
    };
  }

  disconnect() {
    chatWebSocket.disconnect();
    this.isInitialized = false;
  }

  // File handling methods
  async uploadAttachment(file: Blob, type: string, conversationId: string): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('conversation_id', conversationId);

      const response = await fetch(`${API_URL}/attachments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload attachment');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  // Voice message methods
  async uploadVoiceMessage(audioBlob: Blob, conversationId: string): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', audioBlob);
      formData.append('type', 'voice');
      formData.append('conversation_id', conversationId);

      const response = await fetch(`${API_URL}/attachments/voice`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload voice message');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Error uploading voice message:', error);
      throw error;
    }
  }
}

export default ChatService.getInstance();