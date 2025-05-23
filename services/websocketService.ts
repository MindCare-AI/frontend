import { WS_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'reaction' | 'presence' | 'heartbeat';
  event?: string;
  message?: any;
  user_id?: string;
  username?: string;
  is_typing?: boolean;
  message_id?: string;
  reaction?: string;
  action?: string;
  conversation_id?: string;
  timestamp?: string;
}

export interface MessageData {
  content: string;
  message_type?: string;
  metadata?: any;
  media_id?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private conversationId: string | null = null;
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

  // Connect to WebSocket for a specific conversation
  async connect(conversationId: string): Promise<void> {
    // If already connected to the same conversation, don't reconnect
    if (this.isConnecting || 
       (this.ws && 
        this.ws.readyState === WebSocket.OPEN && 
        this.conversationId === conversationId)) {
      console.log('[WebSocket] 🔄 Already connected to conversation', conversationId);
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.conversationId = conversationId;
    this.connectionStartTime = Date.now();

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('[WebSocket] ❌ No access token found');
        throw new Error('No access token found');
      }

      const wsUrl = `${WS_BASE_URL}/ws/conversation/${conversationId}/?token=${token}`;
      console.log(`[WebSocket] 🚀 Connecting to: ${wsUrl}`);
      console.log(`[WebSocket] 📊 Connection attempt #${this.reconnectAttempts + 1}`);

      this.ws = new WebSocket(wsUrl);

      // Create a promise to handle connection result
      return new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          console.error('[WebSocket] ⏰ Connection timeout');
          this.isConnecting = false;
          reject(new Error('Connection timeout'));
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(connectionTimeout);
          const connectionTime = Date.now() - this.connectionStartTime;
          console.log(`[WebSocket] ✅ Connected successfully for conversation: ${conversationId}`);
          console.log(`[WebSocket] ⏱️ Connection established in ${connectionTime}ms`);
          console.log(`[WebSocket] 🔗 ReadyState: ${this.ws?.readyState} (OPEN)`);
          
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.lastPingTime = Date.now();
          this.notifyConnectionCallbacks(true);
          
          // Log connection details
          this.logConnectionStatus();
          this.startHeartbeatMonitoring();
          resolve();
        };

        this.ws!.onmessage = this.handleMessageEvent;

        this.ws!.onclose = (event) => {
          console.log(`[WebSocket] 🔌 Connection closed - Code: ${event.code}, Reason: "${event.reason}"`);
          console.log(`[WebSocket] 📊 Connection was open for: ${Date.now() - this.connectionStartTime}ms`);
          console.log(`[WebSocket] 📈 Messages sent: ${this.messagesSentCount}, received: ${this.messagesReceivedCount}`);
          
          this.isConnecting = false;
          this.notifyConnectionCallbacks(false);
          this.stopHeartbeatMonitoring();
          
          // Log close reasons
          if (event.code === 1000) {
            console.log('[WebSocket] ✅ Normal closure');
          } else if (event.code === 1006) {
            console.log('[WebSocket] ⚠️ Abnormal closure (connection lost)');
          } else if (event.code === 4001) {
            console.log('[WebSocket] 🔒 Authentication failed');
          } else {
            console.log(`[WebSocket] ❓ Unknown close code: ${event.code}`);
          }
          
          // Attempt to reconnect if not intentionally closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log(`[WebSocket] 🔄 Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
            this.scheduleReconnect();
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[WebSocket] ❌ Max reconnection attempts reached');
          }
        };

        this.ws!.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('[WebSocket] ❌ WebSocket error occurred:', error);
          console.log(`[WebSocket] 🔗 ReadyState at error: ${this.ws?.readyState}`);
          this.isConnecting = false;
          this.notifyConnectionCallbacks(false);
          reject(error);
        };
      });

    } catch (error) {
      console.error('[WebSocket] ❌ Error during connection setup:', error);
      this.isConnecting = false;
      throw error;
    }
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
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.messagesSentCount = 0;
    this.messagesReceivedCount = 0;
  }

  // Send a message through WebSocket
  sendMessage(messageData: MessageData): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] ❌ Cannot send message - WebSocket not connected');
      console.log(`[WebSocket] 🔗 Current state: ${this.ws?.readyState || 'null'}`);
      throw new Error('WebSocket is not connected');
    }

    const payload = {
      type: 'message',
      content: messageData.content,
      message_type: messageData.message_type || 'text',
      metadata: messageData.metadata || {},
      ...(messageData.media_id && { media_id: messageData.media_id })
    };

    this.messagesSentCount++;
    console.log(`[WebSocket] 📤 Sending message (#${this.messagesSentCount}):`, payload);
    console.log(`[WebSocket] 💬 Content: "${payload.content.substring(0, 100)}${payload.content.length > 100 ? '...' : ''}"`);
    
    try {
      this.ws.send(JSON.stringify(payload));
      console.log('[WebSocket] ✅ Message sent successfully');
    } catch (error) {
      console.error('[WebSocket] ❌ Error sending message:', error);
      throw error;
    }
  }

  // Send typing indicator
  sendTyping(isTyping: boolean): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] ⚠️ Cannot send typing indicator - WebSocket not connected');
      return;
    }

    const payload = {
      type: 'typing',
      is_typing: isTyping
    };

    console.log(`[WebSocket] ⌨️ Sending typing indicator: ${isTyping ? 'started' : 'stopped'}`);
    this.ws.send(JSON.stringify(payload));
  }

  // Send read receipt
  sendReadReceipt(messageId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] ⚠️ Cannot send read receipt - WebSocket not connected');
      return;
    }

    const payload = {
      type: 'read',
      message_id: messageId
    };

    console.log(`[WebSocket] 👁️ Sending read receipt for message: ${messageId}`);
    this.ws.send(JSON.stringify(payload));
  }

  // Send reaction
  sendReaction(messageId: string, reaction: string, action: 'add' | 'remove' = 'add'): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] ⚠️ Cannot send reaction - WebSocket not connected');
      return;
    }

    const payload = {
      type: 'reaction',
      message_id: messageId,
      reaction,
      action
    };

    console.log(`[WebSocket] 👍 Sending reaction: ${action} "${reaction}" to message ${messageId}`);
    this.ws.send(JSON.stringify(payload));
  }

  // Check if WebSocket is connected
  isConnected(): boolean {
    const connected = this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    console.log(`[WebSocket] 🔍 Connection check: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
    return connected;
  }

  // Get current conversation ID
  getCurrentConversationId(): string | null {
    console.log(`[WebSocket] 🆔 Current conversation ID: ${this.conversationId || 'none'}`);
    return this.conversationId;
  }

  // Get connection statistics
  getConnectionStats() {
    const stats = {
      isConnected: this.isConnected(),
      conversationId: this.conversationId,
      reconnectAttempts: this.reconnectAttempts,
      messagesSent: this.messagesSentCount,
      messagesReceived: this.messagesReceivedCount,
      connectionUptime: this.connectionStartTime ? Date.now() - this.connectionStartTime : 0,
      readyState: this.ws?.readyState || 'null',
      lastPing: this.lastPingTime ? Date.now() - this.lastPingTime : 0
    };
    
    console.log('[WebSocket] 📊 Connection Statistics:', stats);
    return stats;
  }

  // Log detailed connection status
  private logConnectionStatus(): void {
    console.group('[WebSocket] 📋 Connection Status');
    console.log(`🔗 State: ${this.getReadyStateText()}`);
    console.log(`🆔 Conversation: ${this.conversationId}`);
    console.log(`🔄 Reconnect attempts: ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    console.log(`📤 Messages sent: ${this.messagesSentCount}`);
    console.log(`📥 Messages received: ${this.messagesReceivedCount}`);
    console.log(`⏱️ Connection time: ${Date.now() - this.connectionStartTime}ms`);
    console.log(`🌐 URL: ${WS_BASE_URL}/ws/conversation/${this.conversationId}/`);
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
    this.disconnect(true); // Force disconnect
    
    // Attempt to reconnect if we have a conversation ID
    if (this.conversationId) {
      console.log('[WebSocket] 🔄 Attempting to reconnect due to stale connection');
      this.connect(this.conversationId);
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
        type: 'heartbeat',
        event: 'pong',
        timestamp: new Date().toISOString()
      };
      
      console.log('[WebSocket] ❤️ Sending heartbeat response');
      this.ws.send(JSON.stringify(pongMessage));
    }
  }

  // Private methods
  private notifyMessageCallbacks(message: WebSocketMessage): void {
    console.log(`[WebSocket] 📢 Notifying ${this.messageCallbacks.length} message callback(s)`);
    this.messageCallbacks.forEach((callback, index) => {
      try {
        callback(message);
        console.log(`[WebSocket] ✅ Callback ${index + 1} executed successfully`);
      } catch (error) {
        console.error(`[WebSocket] ❌ Error in message callback ${index + 1}:`, error);
      }
    });
  }

  private notifyConnectionCallbacks(connected: boolean): void {
    console.log(`[WebSocket] 📢 Notifying ${this.connectionCallbacks.length} connection callback(s) - Status: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
    this.connectionCallbacks.forEach((callback, index) => {
      try {
        callback(connected);
        console.log(`[WebSocket] ✅ Connection callback ${index + 1} executed successfully`);
      } catch (error) {
        console.error(`[WebSocket] ❌ Error in connection callback ${index + 1}:`, error);
      }
    });
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[WebSocket] ⏰ Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    console.log(`[WebSocket] 🎯 Will attempt to reconnect to conversation: ${this.conversationId}`);
    
    setTimeout(() => {
      if (this.conversationId && this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log(`[WebSocket] 🔄 Executing reconnect attempt ${this.reconnectAttempts}`);
        this.connect(this.conversationId);
      }
    }, delay);
  }

  // Subscribe to WebSocket messages
  onMessage(callback: (message: WebSocketMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    console.log(`[WebSocket] 📝 Message callback registered (total: ${this.messageCallbacks.length})`);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
        console.log(`[WebSocket] 📝 Message callback unregistered (remaining: ${this.messageCallbacks.length})`);
      }
    };
  }

  // Subscribe to connection status changes
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);
    console.log(`[WebSocket] 📝 Connection callback registered (total: ${this.connectionCallbacks.length})`);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
        console.log(`[WebSocket] 📝 Connection callback unregistered (remaining: ${this.connectionCallbacks.length})`);
      }
    };
  }

  private handleMessageEvent = (event: MessageEvent) => {
    try {
      this.messagesReceivedCount++;
      const data: WebSocketMessage = JSON.parse(event.data);
      
      console.log(`[WebSocket] 📨 Message received (#${this.messagesReceivedCount}):`, data);
      console.log(`[WebSocket] 📊 Message type: ${data.type}, Event: ${data.event || 'N/A'}`);
      
      // Handle heartbeat messages first
      if (data.type === 'heartbeat') {
        console.log(`[WebSocket] ❤️ Heartbeat received`);
        this.lastHeartbeat = Date.now();
        this.missedHeartbeats = 0;
        
        // Send heartbeat response
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const pongMessage = {
            type: 'heartbeat',
            event: 'pong',
            timestamp: new Date().toISOString()
          };
          console.log('[WebSocket] ❤️ Sending heartbeat response');
          this.ws.send(JSON.stringify(pongMessage));
        }
        return; // Don't propagate heartbeat messages to callbacks
      }
      
      // Handle other message types
      if (data.type === 'message' && data.message) {
        console.log(`[WebSocket] 💬 New message from ${data.message.sender_name}: "${data.message.content?.substring(0, 50)}${data.message.content?.length > 50 ? '...' : ''}"`);
      } else if (data.type === 'typing') {
        console.log(`[WebSocket] ⌨️ Typing indicator from ${data.username}: ${data.is_typing ? 'started' : 'stopped'}`);
      } else if (data.type === 'read') {
        console.log(`[WebSocket] 👁️ Read receipt from ${data.username} for message ${data.message_id}`);
      } else if (data.type === 'presence') {
        console.log(`[WebSocket] 👤 Presence update: ${data.username} is ${data.event}`);
      }
      
      this.notifyMessageCallbacks(data);
    } catch (error) {
      console.error('[WebSocket] ❌ Error parsing message:', error);
      console.error('[WebSocket] 📄 Raw message data:', event.data);
    }
  };
}

// Export singleton instance
export default new WebSocketService();
