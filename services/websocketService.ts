import { WS_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// Define WebSocket state types
type WebSocketState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';
type MessageHandler = (data: any) => void;

// Event callback types
type EventHandlers = {
  onOpen?: () => void;
  onMessage?: MessageHandler;
  onError?: (error: any) => void;
  onClose?: (event: { code: number; reason: string }) => void;
};

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // Start with 3 seconds
  private url: string = '';
  private messageHandlers: MessageHandler[] = [];
  private eventHandlers: EventHandlers = {};
  private isReconnecting = false;
  private isManualClose = false; // Flag to track if closing was manual

  // Get JWT token from AsyncStorage
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  // Connect to WebSocket with proper authentication
  public async connect(
    path: string,
    handlers?: EventHandlers,
    forceNew = false
  ): Promise<WebSocket | null> {
    // If we already have a socket and it's open, return it unless forced to create a new one
    if (this.socket && this.socket.readyState === WebSocket.OPEN && !forceNew) {
      return this.socket;
    }

    // Close any existing socket before creating a new one
    if (this.socket && (forceNew || this.socket.readyState !== WebSocket.CLOSED)) {
      this.isManualClose = true;
      this.socket.close();
      this.socket = null;
    }

    // Reset flags
    this.isManualClose = false;
    this.reconnectAttempts = 0;

    try {
      // Get auth token
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Construct WebSocket URL with the token
      const separator = path.includes('?') ? '&' : '?';
      this.url = `${WS_BASE_URL}${path}${separator}token=${token}`;

      // Store event handlers
      this.eventHandlers = handlers || {};

      // Create a new WebSocket
      this.socket = new WebSocket(this.url);

      // Set up event listeners
      this.setupEventListeners();

      return this.socket;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      return null;
    }
  }

  // Connect to presence WebSocket specifically
  public async connectToPresence(handlers?: EventHandlers): Promise<WebSocket | null> {
    return this.connect('/ws/presence/', handlers);
  }

  // Set up WebSocket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // onopen handler
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      if (this.eventHandlers.onOpen) {
        this.eventHandlers.onOpen();
      }
    };

    // onmessage handler
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Call all registered message handlers
        this.messageHandlers.forEach(handler => handler(data));
        
        // Call the onMessage event handler if provided
        if (this.eventHandlers.onMessage) {
          this.eventHandlers.onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // onerror handler
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(error);
      }
    };

    // onclose handler
    this.socket.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      
      if (this.eventHandlers.onClose) {
        this.eventHandlers.onClose({ code: event.code, reason: event.reason });
      }

      // Don't attempt to reconnect if manually closed
      if (!this.isManualClose && !this.isReconnecting) {
        this.attemptReconnect();
      }
    };
  }

  // Attempt to reconnect with exponential backoff
  private attemptReconnect(): void {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      // If we've exceeded max attempts, show an error
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Failed to reconnect WebSocket after multiple attempts');
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Connection Error',
            'Failed to establish a stable connection. Please check your internet connection and try again.'
          );
        }
      }
      return;
    }

    this.isReconnecting = true;
    
    // Clear any existing timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Calculate backoff time (exponential backoff)
    const backoff = Math.min(
      this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts),
      30000 // Max 30 seconds
    );

    console.log(`Attempting to reconnect in ${backoff}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectAttempts++;
      this.isReconnecting = false;
      
      // Attempt to reconnect using the same URL
      await this.connect(this.url.replace(WS_BASE_URL, ''), this.eventHandlers, true);
    }, backoff);
  }

  // Send a message through the WebSocket
  public send(message: object | string): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, WebSocket is not connected');
      return false;
    }

    try {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      this.socket.send(data);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  // Register a message handler
  public addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  // Remove a message handler
  public removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  // Close the WebSocket connection
  public close(): void {
    if (this.socket) {
      this.isManualClose = true;
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.messageHandlers = [];
    this.eventHandlers = {};
  }

  // Get the current state of the WebSocket connection
  public getState(): WebSocketState | null {
    if (!this.socket) return null;
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return null;
    }
  }

  // Check if WebSocket is connected
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create and export a singleton instance
const websocketService = new WebSocketService();
export default websocketService;