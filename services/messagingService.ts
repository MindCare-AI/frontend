import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, WS_BASE_URL } from '../config';
import type { Conversation, Message, TypingIndicator, MessageType, FileAttachment, WebSocketEvent } from '../types/messaging';
import websocketService from './websocketService';

class MessagingService {
  private messageQueue: Message[] = [];
  private eventHandlers: Map<string, Set<Function>> = new Map();
  private currentConversationId: string | null = null;

  constructor() {
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.eventHandlers.set('message_created', new Set());
    this.eventHandlers.set('typing', new Set());
    this.eventHandlers.set('read_receipt', new Set());
    this.eventHandlers.set('reaction', new Set());
    this.eventHandlers.set('presence', new Set());
  }

  public addEventListener(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event) || new Set();
    handlers.add(handler);
    this.eventHandlers.set(event, handlers);
  }

  public removeEventListener(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Handle incoming WebSocket messages
  private handleMessage = (data: any) => {
    try {
      const message: WebSocketEvent = typeof data === 'string' ? JSON.parse(data) : data;
      this.emit(message.type, message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  public async connect(conversationId?: string) {
    this.currentConversationId = conversationId || null;
    
    const path = conversationId 
      ? `/messaging/${conversationId}/`
      : `/presence/`;
    
    // Connect using the websocket service
    const socket = await websocketService.connect(
      path,
      {
        onOpen: () => {
          console.log('Messaging WebSocket connected');
          this.sendQueuedMessages();
        },
        onMessage: this.handleMessage,
        onError: (error) => {
          console.error('Messaging WebSocket error:', error);
        },
        onClose: () => {
          console.log('Messaging WebSocket closed');
        }
      },
      true // Force a new connection
    );
    
    return socket;
  }

  private async getAuthToken(): Promise<string> {
    const token = await AsyncStorage.getItem('accessToken');
    return token || '';
  }

  public getWebSocketUrl(conversationId?: string): string {
    const base = WS_BASE_URL.replace(/^http/, 'ws');
    return conversationId
      ? `${base}/messaging/${conversationId}/?token=${AsyncStorage.getItem('accessToken')}`
      : `${base}/presence/?token=${AsyncStorage.getItem('accessToken')}`;
  }

  public async getMessages(conversationId: string, beforeMessageId?: string): Promise<Message[]> {
    const token = await this.getAuthToken();
    const params = new URLSearchParams();
    params.append('conversation_id', conversationId);
    if (beforeMessageId) params.append('before', beforeMessageId);
    const response = await fetch(`${API_BASE_URL}/messaging/one_to_one/messages/?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    return data.results || data;
  }

  private async sendQueuedMessages() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.sendMessage(message);
      }
    }
  }

  public disconnect() {
    websocketService.close();
    this.currentConversationId = null;
  }

  public async sendMessage(message: Partial<Message>) {
    try {
      const success = websocketService.send({
        type: 'send_message',
        ...message
      });
      
      if (!success) {
        // Queue the message if sending failed
        this.messageQueue.push(message as Message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      this.messageQueue.push(message as Message);
    }
  }

  // REST API Methods
  public async getConversations(page = 1): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/messaging/one_to_one/?page=${page}`, {
      headers: {
        Authorization: `Bearer ${await this.getAuthToken()}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
  }

  public async createOneToOneConversation(recipientId: string): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/messaging/one_to_one/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await this.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipient_id: recipientId })
    });

    if (!response.ok) throw new Error('Failed to create conversation');
    return response.json();
  }

  public async sendTypingIndicator(conversationId: string, isTyping: boolean) {
    websocketService.send({
      type: 'typing',
      conversation_id: conversationId,
      is_typing: isTyping
    });
  }

  public async uploadAttachment(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress((event.loaded / event.total) * 100);
        }
      };
    }

    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.url);
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));
      
      xhr.open('POST', `${API_BASE_URL}/messaging/attachments/`);
      xhr.setRequestHeader('Authorization', `Bearer ${this.getAuthToken()}`);
      xhr.send(formData);
    });
  }

  public async markMessageAsRead(messageId: string) {
    websocketService.send({
      type: 'mark_read',
      message_id: messageId
    });
  }

  public async addReaction(messageId: string, reaction: string): Promise<void> {
    const token = await this.getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/messaging/one_to_one/messages/${messageId}/reactions/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reaction })
      }
    );
    if (!response.ok) {
      throw new Error('Failed to add reaction');
    }
  }

  public async removeReaction(messageId: string, reaction: string): Promise<void> {
    const token = await this.getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/messaging/one_to_one/messages/${messageId}/reactions/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reaction })
      }
    );
    if (!response.ok) {
      throw new Error('Failed to remove reaction');
    }
  }
}

export const messagingService = new MessagingService();
export default messagingService;