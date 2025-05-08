// Modified to fix import errors
import { Message, MessageRequest, ChatbotConversation } from '../types/chat';
import { API_URL } from '../config';
import chatService from './chatService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import websocketService from './websocketService';

class ChatbotService {
  private currentConversation: ChatbotConversation | null = null;
  private messageQueue: MessageRequest[] = [];
  private isProcessing = false;
  private eventHandlers: Map<string, Set<Function>> = new Map();
  private socket: WebSocket | null = null;

  constructor() {
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.eventHandlers.set('message_received', new Set());
    this.eventHandlers.set('typing_started', new Set());
    this.eventHandlers.set('typing_stopped', new Set());
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

  private handleMessage = (data: any) => {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (message.type === 'message') {
        this.emit('message_received', message.data);
        chatService.handleNewMessage(message.data);
      } else if (message.type === 'typing_started') {
        this.emit('typing_started', message.data);
      } else if (message.type === 'typing_stopped') {
        this.emit('typing_stopped', message.data);
      }
    } catch (error) {
      console.error('Error parsing chatbot WebSocket message:', error);
    }
  };

  async connectToWebSocket(): Promise<WebSocket | null> {
    if (!this.currentConversation) {
      return null;
    }

    this.socket = await websocketService.connect(
      `/chatbot/${this.currentConversation.id}/`,
      {
        onOpen: () => {
          console.log('Chatbot WebSocket connected');
        },
        onMessage: this.handleMessage,
        onError: (error) => {
          console.error('Chatbot WebSocket error:', error);
        },
        onClose: () => {
          console.log('Chatbot WebSocket closed');
        }
      }
    );

    return this.socket;
  }

  async disconnectFromWebSocket() {
    if (this.socket) {
      websocketService.close();
      this.socket = null;
    }
  }

  async initializeConversation(): Promise<ChatbotConversation> {
    try {
      const response = await fetch(`${API_URL}/chatbot/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initial_message: "Hello, I need help." })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize chatbot conversation');
      }

      const conversation = await response.json();
      this.currentConversation = conversation;
      
      // Connect to the WebSocket for this conversation
      await this.connectToWebSocket();
      
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

      // Send typing indicator through WebSocket
      if (websocketService.isConnected()) {
        websocketService.send({
          type: 'typing',
          is_typing: true
        });
      }

      const response = await fetch(`${API_URL}/chatbot/${this.currentConversation!.id}/send_message/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
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
    } finally {
      // Stop typing indicator
      if (websocketService.isConnected()) {
        websocketService.send({
          type: 'typing',
          is_typing: false
        });
      }
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
      const response = await fetch(`${API_URL}/chatbot/${conversationId}/`, {
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
      const response = await fetch(`${API_URL}/chatbot/${conversationId}/clear/`, {
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
    
    // Connect to WebSocket with new conversation
    if (conversation) {
      this.connectToWebSocket();
    } else {
      this.disconnectFromWebSocket();
    }
  }

  getCurrentConversation(): ChatbotConversation | null {
    return this.currentConversation;
  }

  // Setup network change listener to process queue when connection is restored
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.processQueue();
        
        // Reconnect to WebSocket if needed
        if (this.currentConversation && !websocketService.isConnected()) {
          this.connectToWebSocket();
        }
      }
    });
  }
}

export const chatbotService = new ChatbotService();
chatbotService.setupNetworkListener();
export default chatbotService;