import { WS_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend-compatible WebSocket message interface
export interface WebSocketMessage {
  event: 'chat.message' | 'typing.indicator' | 'read.receipt' | 'message.reaction' | 'user.online' | 'user.offline' | 'heartbeat';
  type?: 'message' | 'typing' | 'read' | 'reaction' | 'presence' | 'heartbeat';
  
  // Message data for chat.message events
  message?: {
    id: string | number;
    content: string;
    message_type: 'text' | 'image' | 'file' | 'system';
    sender_id: string | number;
    sender_name: string;
    timestamp: string;
    conversation_id: string | number;
    media?: string | null;
    metadata?: any;
  };
  
  // Typing indicator data
  user_id?: string | number;
  username?: string;
  is_typing?: boolean;
  
  // Read receipt data
  message_id?: string | number;
  read_by?: string | number;
  
  // Reaction data
  reaction?: string;
  action?: 'add' | 'remove';
  
  // Presence data
  user?: {
    id: string | number;
    username: string;
    status: 'online' | 'offline';
  };
  
  // Heartbeat data
  timestamp?: string;
  
  // General fields
  conversation_id?: string | number;
  conversation_type?: 'one-to-one' | 'group';
}

export interface MessageData {
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'system';
  metadata?: any;
  media_id?: string;
}

// Add debug flag at the top
const DEBUG_WEBSOCKET = __DEV__ && false; // Set to false to reduce logs

class WebSocketService {
  private ws: WebSocket | null = null;
  private conversationId: string | null = null;
  private conversationType: 'one-to-one' | 'group' | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private messageCallbacks: ((message: WebSocketMessage) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private isConnecting = false;
  private connectionStartTime: number = 0;
  private lastPingTime: number = 0;
  private messagesSentCount = 0;
  private messagesReceivedCount = 0;
  private lastHeartbeat: number = 0;
  private heartbeatInterval: number = 30000; // 30 seconds, matching backend
  private heartbeatCheckTimer: NodeJS.Timeout | null = null;
  private missedHeartbeats: number = 0;
  private readonly MAX_MISSED_HEARTBEATS = 3;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  // Circuit breaker properties
  private circuitBreakerOpen = false;
  private circuitBreakerOpenTime = 0;
  private circuitBreakerTimeout = 60000; // 1 minute
  private consecutiveFailures = 0;
  private maxConsecutiveFailures = 10;
  
  // Store user info for reconnection
  private lastUserId: string | null = null;
  private lastUsername: string | null = null;

  // Connect to WebSocket for a specific conversation with type
  async connect(params: {
    userId: string | number;
    username: string;
    conversationId: string;
    conversationType: 'one-to-one' | 'group';
  }): Promise<void> {
    const { userId, username, conversationId, conversationType } = params;
    
    // Store user info for reconnection
    this.lastUserId = userId.toString();
    this.lastUsername = username;
    
    // Check circuit breaker
    if (this.isCircuitBreakerOpen()) {
      console.log('[WebSocket] Circuit breaker is open, skipping connection attempt');
      throw new Error('Circuit breaker is open');
    }
    
    // If already connected to the same conversation, don't reconnect
    if (this.isConnecting || 
       (this.ws && 
        this.ws.readyState === WebSocket.OPEN && 
        this.conversationId === conversationId &&
        this.conversationType === conversationType)) {
      if (DEBUG_WEBSOCKET) {
        console.log('[WebSocket] Already connected to conversation', conversationId, `(${conversationType})`);
      }
      return Promise.resolve();
    }

    // If connecting to a different conversation, disconnect first
    if (this.ws && this.conversationId && 
       (this.conversationId !== conversationId || this.conversationType !== conversationType)) {
      if (DEBUG_WEBSOCKET) {
        console.log('[WebSocket] Switching conversations, disconnecting first');
      }
      this.disconnect(true);
    }

    this.isConnecting = true;
    this.conversationId = conversationId;
    this.conversationType = conversationType;
    this.connectionStartTime = Date.now();

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('[WebSocket] No access token found');
        this.handleConnectionFailure();
        throw new Error('No access token found');
      }

      const wsUrl = `${WS_BASE_URL}/ws/${conversationType}/${conversationId}/?token=${token}`;
      console.log(`[WebSocket] Connecting to ${conversationType} conversation: ${conversationId}`);

      this.ws = new WebSocket(wsUrl);

      // Create a promise to handle connection result
      return new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          console.error('[WebSocket] Connection timeout');
          this.isConnecting = false;
          this.handleConnectionFailure();
          reject(new Error('Connection timeout'));
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(connectionTimeout);
          const connectionTime = Date.now() - this.connectionStartTime;
          console.log(`[WebSocket] Connected successfully (${connectionTime}ms)`);
          
          this.reconnectAttempts = 0;
          this.consecutiveFailures = 0;
          this.circuitBreakerOpen = false;
          this.isConnecting = false;
          this.lastPingTime = Date.now();
          this.notifyConnectionCallbacks(true);
          
          if (DEBUG_WEBSOCKET) {
            this.logConnectionStatus();
          }
          this.startHeartbeatMonitoring();
          resolve();
        };

        this.ws!.onmessage = this.handleMessageEvent;

        this.ws!.onclose = (event) => {
          if (DEBUG_WEBSOCKET) {
            console.log(`[WebSocket] Connection closed - Code: ${event.code}, Reason: "${event.reason}"`);
          }
          
          this.isConnecting = false;
          this.notifyConnectionCallbacks(false);
          this.stopHeartbeatMonitoring();
          
          // Handle connection failure
          this.handleConnectionFailure();
          
          // Attempt to reconnect if not intentionally closed and circuit breaker allows
          if (event.code !== 1000 && 
              this.reconnectAttempts < this.maxReconnectAttempts &&
              !this.isCircuitBreakerOpen()) {
            if (DEBUG_WEBSOCKET) {
              console.log(`[WebSocket] Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
            }
            this.scheduleReconnect();
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('[WebSocket] Max reconnection attempts reached');
            this.openCircuitBreaker();
          }
        };

        this.ws!.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('[WebSocket] Connection error occurred:', error);
          this.isConnecting = false;
          this.handleConnectionFailure();
          this.notifyConnectionCallbacks(false);
          reject(error);
        };
      });

    } catch (error) {
      console.error('[WebSocket] Error during connection setup:', error);
      this.isConnecting = false;
      this.handleConnectionFailure();
      throw error;
    }
  }

  private handleConnectionFailure(): void {
    this.consecutiveFailures++;
    
    if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
      console.warn(`[WebSocket] Too many consecutive failures (${this.consecutiveFailures}), opening circuit breaker`);
      this.openCircuitBreaker();
    }
  }

  private isCircuitBreakerOpen(): boolean {
    if (!this.circuitBreakerOpen) {
      return false;
    }
    
    // Check if circuit breaker timeout has passed
    if (Date.now() - this.circuitBreakerOpenTime > this.circuitBreakerTimeout) {
      console.log('[WebSocket] Circuit breaker timeout passed, allowing connection attempts');
      this.circuitBreakerOpen = false;
      this.consecutiveFailures = 0;
      return false;
    }
    
    return true;
  }

  private openCircuitBreaker(): void {
    this.circuitBreakerOpen = true;
    this.circuitBreakerOpenTime = Date.now();
    console.warn(`[WebSocket] Circuit breaker opened for ${this.circuitBreakerTimeout / 1000} seconds`);
  }

  // Add method to reset circuit breaker manually
  resetCircuitBreaker(): void {
    this.circuitBreakerOpen = false;
    this.consecutiveFailures = 0;
    this.reconnectAttempts = 0;
    console.log('[WebSocket] Circuit breaker reset manually');
  }

  // Cleanup method to reset state
  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeatMonitoring();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  // Disconnect from WebSocket
  disconnect(force: boolean = false): void {
    // If force is false, just log but don't disconnect
    if (!force) {
      console.log('[WebSocket] 🔌 Disconnect requested but keeping connection alive');
      return;
    }

    // Otherwise disconnect as usual
    if (this.ws) {
      console.log('[WebSocket] 🔌 Manually disconnecting...');
      console.log(`[WebSocket] 📊 Final stats - Sent: ${this.messagesSentCount}, Received: ${this.messagesReceivedCount}`);
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.conversationId = null;
    this.conversationType = null;
    this.cleanup();
    this.messagesSentCount = 0;
    this.messagesReceivedCount = 0;
  }

  // Send a message through WebSocket
  sendMessage(messageData: MessageData): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send message - not connected');
      throw new Error('WebSocket is not connected');
    }
    const payload = {
      event: 'chat.message',
      type: 'message',
      content: messageData.content,
      message_type: messageData.message_type || 'text',
      metadata: messageData.metadata || {},
      ...(messageData.media_id && { media_id: messageData.media_id })
    };
    this.messagesSentCount++;
    if (DEBUG_WEBSOCKET) {
      console.log(`[WebSocket] Sending message (#${this.messagesSentCount}):`, payload.content.substring(0, 50));
    }
    try {
      this.ws.send(JSON.stringify(payload));
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
      throw error;
    }
  }

  // Send read receipt
  sendReadReceipt(messageId: string | number): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (DEBUG_WEBSOCKET) {
        console.warn('[WebSocket] Cannot send read receipt - not connected');
      }
      return;
    }
    const payload = {
      event: 'read.receipt',
      type: 'read',
      message_id: messageId,
      conversation_id: this.conversationId,
      conversation_type: this.conversationType,
    };
    if (DEBUG_WEBSOCKET) {
      console.log(`[WebSocket] Sending read receipt for message: ${messageId}`);
    }
    try {
      this.ws.send(JSON.stringify(payload));
    } catch (error) {
      console.error('[WebSocket] Error sending read receipt:', error);
    }
  }

  // Send typing indicator
  sendTyping(isTyping: boolean): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    const payload = {
      event: 'typing.indicator',
      type: 'typing',
      is_typing: isTyping,
    };
    if (DEBUG_WEBSOCKET) {
      console.log(`[WebSocket] Typing indicator: ${isTyping ? 'started' : 'stopped'}`);
    }
    this.ws.send(JSON.stringify(payload));
  }

  // Send reaction
  sendReaction(messageId: string, reaction: string, action: 'add' | 'remove' = 'add'): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = {
      event: 'message.reaction',
      type: 'reaction',
      message_id: messageId,
      reaction,
      action,
    };

    if (DEBUG_WEBSOCKET) {
      console.log(`[WebSocket] Sending reaction: ${action} "${reaction}" to message ${messageId}`);
    }
    this.ws.send(JSON.stringify(payload));
  }

  // Check if WebSocket is connected
  isConnected(): boolean {
    const connected = this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    return connected;
  }

  // Get current conversation ID
  getCurrentConversationId(): string | null {
    return this.conversationId;
  }

  // Get current conversation type
  getCurrentConversationType(): 'one-to-one' | 'group' | null {
    return this.conversationType;
  }

  // Get connection statistics
  getConnectionStats() {
    const stats = {
      isConnected: this.isConnected(),
      conversationId: this.conversationId,
      conversationType: this.conversationType,
      reconnectAttempts: this.reconnectAttempts,
      consecutiveFailures: this.consecutiveFailures,
      circuitBreakerOpen: this.circuitBreakerOpen,
      messagesSent: this.messagesSentCount,
      messagesReceived: this.messagesReceivedCount,
      connectionUptime: this.connectionStartTime ? Date.now() - this.connectionStartTime : 0,
      readyState: this.ws?.readyState || 'null',
      lastPing: this.lastPingTime ? Date.now() - this.lastPingTime : 0,
      lastUserId: this.lastUserId,
      lastUsername: this.lastUsername
    };
    
    if (DEBUG_WEBSOCKET) {
      console.log('[WebSocket] Connection Statistics:', stats);
    }
    return stats;
  }

  // Log detailed connection status
  private logConnectionStatus(): void {
    console.group('[WebSocket] 📋 Connection Status');
    console.log(`🔗 State: ${this.getReadyStateText()}`);
    console.log(`🆔 Conversation: ${this.conversationId}`);
    console.log(`🎭 Type: ${this.conversationType}`);
    console.log(`🔄 Reconnect attempts: ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    console.log(`📤 Messages sent: ${this.messagesSentCount}`);
    console.log(`📥 Messages received: ${this.messagesReceivedCount}`);
    console.log(`⏱️ Connection time: ${Date.now() - this.connectionStartTime}ms`);
    console.log(`🌐 URL: ${WS_BASE_URL}/ws/${this.conversationType}/${this.conversationId}/`);
    console.groupEnd();
  }

  // Get human-readable ready state
  private getReadyStateText(): string {
    if (!this.ws) return 'NULL';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING (0)';
      case WebSocket.OPEN: return 'OPEN (1)';
      case WebSocket.CLOSING: return 'CLOSING (2)';
      case WebSocket.CLOSED: return 'CLOSED (3)';
      default: return `UNKNOWN (${this.ws.readyState})`;
    }
  }

  // Heartbeat monitoring methods
  private startHeartbeatMonitoring(): void {
    this.lastHeartbeat = Date.now();
    this.missedHeartbeats = 0;

    // Clear any existing heartbeat check timer
    if (this.heartbeatCheckTimer) {
      clearInterval(this.heartbeatCheckTimer);
    }

    // Start monitoring heartbeats
    this.heartbeatCheckTimer = setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;
      
      if (timeSinceLastHeartbeat > this.heartbeatInterval) {
        this.missedHeartbeats++;
        console.log(`[WebSocket] ❤️ Missed heartbeat #${this.missedHeartbeats}`);
        
        if (this.missedHeartbeats >= this.MAX_MISSED_HEARTBEATS) {
          console.log('[WebSocket] 💔 Connection considered stale, initiating reconnection');
          this.handleStaleConnection();
        }
      }
    }, this.heartbeatInterval);
  }

  private handleStaleConnection(): void {
    console.log('[WebSocket] 💔 Handling stale connection');
    this.disconnect(true); // Force disconnect
    
    // Attempt to reconnect if we have the necessary info
    if (this.conversationId && 
        this.conversationType && 
        this.lastUserId && 
        this.lastUsername &&
        !this.isCircuitBreakerOpen()) {
      console.log('[WebSocket] 🔄 Attempting to reconnect due to stale connection');
      this.connect({
        userId: this.lastUserId,
        username: this.lastUsername,
        conversationId: this.conversationId,
        conversationType: this.conversationType
      }).catch(error => {
        console.error('[WebSocket] Failed to reconnect after stale connection:', error);
      });
    }
  }

  private stopHeartbeatMonitoring(): void {
    if (this.heartbeatCheckTimer) {
      clearInterval(this.heartbeatCheckTimer);
      this.heartbeatCheckTimer = null;
    }
  }

  private handleHeartbeat(): void {
    this.lastHeartbeat = Date.now();
    this.missedHeartbeats = 0;
    console.log('[WebSocket] ❤️ Heartbeat received');
  }

  // Add this method to handle heartbeat messages
  private handleHeartbeatMessage(): void {
    this.lastHeartbeat = Date.now();
    this.missedHeartbeats = 0;
    
    // Send a pong response back to the server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const pongMessage = {
        event: 'heartbeat',
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      };
      
      console.log('[WebSocket] ❤️ Sending heartbeat response');
      this.ws.send(JSON.stringify(pongMessage));
    }
  }

  // Private methods
  private notifyMessageCallbacks(message: WebSocketMessage): void {
    if (DEBUG_WEBSOCKET) {
      console.log(`[WebSocket] Notifying ${this.messageCallbacks.length} message callback(s)`);
    }
    this.messageCallbacks.forEach((callback, index) => {
      try {
        callback(message);
      } catch (error) {
        console.error(`[WebSocket] Error in message callback ${index + 1}:`, error);
      }
    });
  }

  private notifyConnectionCallbacks(connected: boolean): void {
    if (DEBUG_WEBSOCKET) {
      console.log(`[WebSocket] Notifying ${this.connectionCallbacks.length} connection callback(s) - Status: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
    }
    this.connectionCallbacks.forEach((callback, index) => {
      try {
        callback(connected);
      } catch (error) {
        console.error(`[WebSocket] Error in connection callback ${index + 1}:`, error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds    
    );
    
    console.log(`[WebSocket] ⏰ Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    console.log(`[WebSocket] 🎯 Will attempt to reconnect to conversation: ${this.conversationId} (${this.conversationType})`);
    
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      
      if (this.conversationId && 
          this.conversationType && 
          this.reconnectAttempts <= this.maxReconnectAttempts &&
          !this.isCircuitBreakerOpen()) {
        
        console.log(`[WebSocket] 🔄 Executing reconnect attempt ${this.reconnectAttempts}`);
        
        try {
          if (this.lastUserId && this.lastUsername) {
            await this.connect({
              userId: this.lastUserId,
              username: this.lastUsername,
              conversationId: this.conversationId,
              conversationType: this.conversationType
            });
          } else {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
              const user = JSON.parse(userData);
              await this.connect({
                userId: user.id || '',
                username: user.username || '',
                conversationId: this.conversationId,
                conversationType: this.conversationType
              });
            } else {
              console.error('[WebSocket] ❌ No user info available for reconnection');
              this.openCircuitBreaker();
            }
          }
        } catch (error) {
          console.error('[WebSocket] ❌ Reconnection failed:', error);
        }
      }
    }, delay);
  }

  // Subscribe to WebSocket messages
  onMessage(callback: (message: WebSocketMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    if (DEBUG_WEBSOCKET) {
      console.log(`[WebSocket] Message callback registered (total: ${this.messageCallbacks.length})`);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
        if (DEBUG_WEBSOCKET) {
          console.log(`[WebSocket] Message callback unregistered (remaining: ${this.messageCallbacks.length})`);
        }
      }
    };
  }

  // Subscribe to connection status changes
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);
    if (DEBUG_WEBSOCKET) {
      console.log(`[WebSocket] Connection callback registered (total: ${this.connectionCallbacks.length})`);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
        if (DEBUG_WEBSOCKET) {
          console.log(`[WebSocket] Connection callback unregistered (remaining: ${this.connectionCallbacks.length})`);
        }
      }
    };
  }

  private handleMessageEvent = (event: MessageEvent) => {
    try {
      this.messagesReceivedCount++;
      const data: WebSocketMessage = JSON.parse(event.data);
      
      if (DEBUG_WEBSOCKET) {
        console.log(`[WebSocket] Message received (#${this.messagesReceivedCount}):`, data.event);
      }
      
      // Handle heartbeat messages first
      if (data.event === 'heartbeat' || data.type === 'heartbeat') {
        this.lastHeartbeat = Date.now();
        this.missedHeartbeats = 0;
        
        // Send a pong response back to the server
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const pongMessage = {
            event: 'heartbeat',
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          };
          this.ws.send(JSON.stringify(pongMessage));
        }
        return;
      }
      
      // Handle other message types
      if (data.event === 'chat.message' && data.message) {
        console.log(`[WebSocket] New message from ${data.message.sender_name}`);
      } else if (data.event === 'typing.indicator') {
        if (DEBUG_WEBSOCKET) {
          console.log(`[WebSocket] Typing indicator from ${data.username}: ${data.is_typing ? 'started' : 'stopped'}`);
        }
      }
      
      this.notifyMessageCallbacks(data);
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error);
    }
  };
}

// Export singleton instance
export default new WebSocketService();
