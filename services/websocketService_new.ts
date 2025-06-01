import { WS_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Updated WebSocket message interface to match new Django Channels backend
export interface WebSocketMessage {
  type: 'chat.message' | 'typing.indicator' | 'read.receipt' | 'message.reaction' | 'user.online' | 'user.offline' | 'heartbeat';
  event?: string;
  user_id?: string;
  username?: string;
  timestamp?: string;
  
  // Message content (for chat.message type)
  message?: {
    id: string | number;
    content: string;
    sender: string | number;
    sender_name: string;
    message_type: string;
    timestamp: string;
    conversation_id: string | number;
    is_bot?: boolean;
    metadata?: Record<string, any>;
    attachment?: {
      id: string;
      url: string;
      type: string;
      name: string;
      size: number;
    };
    reactions?: Array<{
      id: string;
      emoji: string;
      user_id: string;
      timestamp: string;
    }>;
    read_by?: string[];
    edited?: boolean;
  };
  
  // Typing indicator fields (typing.indicator type)
  is_typing?: boolean;
  
  // Read receipt fields (read.receipt type)
  message_id?: string;
  read_by_user?: string;
  read_at?: string;
  
  // Reaction fields (message.reaction type)
  reaction?: string;
  action?: 'add' | 'remove';
  emoji?: string;
  
  // Presence fields (user.online/offline type)
  presence_status?: 'online' | 'offline';
  last_seen?: string;
  
  // Error handling
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  
  // Backend routing and conversation context
  conversation_id?: string;
  conversation_type?: 'one-to-one' | 'group';
  channel_group?: string;
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
  private conversationType: 'one-to-one' | 'group' = 'one-to-one';
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
  private heartbeatSendTimer: NodeJS.Timeout | null = null;
  private missedHeartbeats: number = 0;
  private readonly MAX_MISSED_HEARTBEATS = 3;

  // Connect to WebSocket for a specific conversation
  async connect(conversationId: string, isGroup: boolean = false): Promise<void> {
    // If already connected to the same conversation, don't reconnect
    if (this.isConnecting || 
       (this.ws && 
        this.ws.readyState === WebSocket.OPEN && 
        this.conversationId === conversationId)) {
      console.log('[WebSocket] 🔄 Already connected to conversation', conversationId);
      return Promise.resolve();
    }

    // If connecting to a different conversation, disconnect first
    if (this.ws && this.conversationId && this.conversationId !== conversationId) {
      console.log('[WebSocket] 🔄 Switching conversations, disconnecting first');
      this.disconnect(true);
    }

    this.isConnecting = true;
    this.conversationId = conversationId;
    this.conversationType = isGroup ? 'group' : 'one-to-one';
    this.connectionStartTime = Date.now();

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('[WebSocket] ❌ No access token found');
        throw new Error('No access token found');
      }

      // Use the new backend URL pattern based on conversation type
      const wsUrl = `${WS_BASE_URL}/ws/${this.conversationType}/${conversationId}/?token=${token}`;
      console.log(`[WebSocket] 🚀 Connecting to: ${wsUrl}`);
      console.log(`[WebSocket] 📊 Connection attempt #${this.reconnectAttempts + 1} for ${this.conversationType} conversation`);

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
          console.log(`[WebSocket] ✅ Connected successfully for ${this.conversationType} conversation: ${conversationId}`);
          console.log(`[WebSocket] ⏱️ Connection established in ${connectionTime}ms`);
          console.log(`[WebSocket] 🔗 ReadyState: ${this.ws?.readyState} (OPEN)`);
          
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.lastPingTime = Date.now();
          this.notifyConnectionCallbacks(true);
          
          // Log connection details and start heartbeat
          this.logConnectionStatus();
          this.startHeartbeatMonitoring();
          this.startHeartbeatSending();
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
          this.stopHeartbeatSending();
          
          // Log close reasons
          if (event.code === 1000) {
            console.log('[WebSocket] ✅ Normal closure');
          } else if (event.code === 1006) {
            console.log('[WebSocket] ⚠️ Abnormal closure (connection lost)');
          } else if (event.code === 4001) {
            console.log('[WebSocket] 🔒 Authentication failed');
          } else if (event.code === 4004) {
            console.log('[WebSocket] 🚫 Invalid conversation access');
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
    this.stopHeartbeatMonitoring();
    this.stopHeartbeatSending();
  }

  // Send a message through WebSocket - Updated to match backend format
  sendMessage(messageData: MessageData): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] ❌ Cannot send message - WebSocket not connected');
      console.log(`[WebSocket] 🔗 Current state: ${this.ws?.readyState || 'null'}`);
      throw new Error('WebSocket is not connected');
    }

    const payload = {
      type: 'chat.message',
      event: 'send_message',
      content: messageData.content,
      message_type: messageData.message_type || 'text',
      metadata: messageData.metadata || {},
      timestamp: new Date().toISOString(),
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

  // Send typing indicator - Updated to match backend format
  sendTyping(isTyping: boolean): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] ⚠️ Cannot send typing indicator - WebSocket not connected');
      return;
    }

    const payload = {
      type: 'typing.indicator',
      event: isTyping ? 'start_typing' : 'stop_typing',
      is_typing: isTyping,
      timestamp: new Date().toISOString()
    };

    console.log(`[WebSocket] ⌨️ Sending typing indicator: ${isTyping ? 'started' : 'stopped'}`);
    this.ws.send(JSON.stringify(payload));
  }

  // Send read receipt - Updated to match backend format
  sendReadReceipt(messageId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] ⚠️ Cannot send read receipt - WebSocket not connected');
      return;
    }

    const payload = {
      type: 'read.receipt',
      event: 'mark_read',
      message_id: messageId,
      timestamp: new Date().toISOString()
    };

    console.log(`[WebSocket] 👁️ Sending read receipt for message: ${messageId}`);
    this.ws.send(JSON.stringify(payload));
  }

  // Send reaction - Updated to match backend format
  sendReaction(messageId: string, emoji: string, action: 'add' | 'remove' = 'add'): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] ⚠️ Cannot send reaction - WebSocket not connected');
      return;
    }

    const payload = {
      type: 'message.reaction',
      event: action === 'add' ? 'add_reaction' : 'remove_reaction',
      message_id: messageId,
      emoji,
      action,
      timestamp: new Date().toISOString()
    };

    console.log(`[WebSocket] 👍 Sending reaction: ${action} "${emoji}" to message ${messageId}`);
    this.ws.send(JSON.stringify(payload));
  }

  // Send user presence update
  sendPresenceUpdate(status: 'online' | 'offline'): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] ⚠️ Cannot send presence update - WebSocket not connected');
      return;
    }

    const payload = {
      type: status === 'online' ? 'user.online' : 'user.offline',
      event: 'presence_update',
      presence_status: status,
      timestamp: new Date().toISOString()
    };

    console.log(`[WebSocket] 👤 Sending presence update: ${status}`);
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

  // Get current conversation type
  getCurrentConversationType(): 'one-to-one' | 'group' {
    return this.conversationType;
  }

  // Get connection statistics
  getConnectionStats() {
    const stats = {
      isConnected: this.isConnected(),
      conversationId: this.conversationId,
      conversationType: this.conversationType,
      reconnectAttempts: this.reconnectAttempts,
      messagesSent: this.messagesSentCount,
      messagesReceived: this.messagesReceivedCount,
      connectionUptime: this.connectionStartTime ? Date.now() - this.connectionStartTime : 0,
      readyState: this.ws?.readyState || 'null',
      lastPing: this.lastPingTime ? Date.now() - this.lastPingTime : 0,
      lastHeartbeat: this.lastHeartbeat ? Date.now() - this.lastHeartbeat : 0,
      missedHeartbeats: this.missedHeartbeats
    };
    
    console.log('[WebSocket] 📊 Connection Statistics:', stats);
    return stats;
  }

  // Log detailed connection status
  private logConnectionStatus(): void {
    console.group('[WebSocket] 📋 Connection Status');
    console.log(`🔗 State: ${this.getReadyStateText()}`);
    console.log(`🆔 Conversation: ${this.conversationId} (${this.conversationType})`);
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

  // Enhanced heartbeat monitoring methods
  private startHeartbeatMonitoring(): void {
    this.lastHeartbeat = Date.now();
    this.missedHeartbeats = 0;

    // Clear any existing heartbeat check timer
    if (this.heartbeatCheckTimer) {
      clearInterval(this.heartbeatCheckTimer);
    }

    // Start monitoring heartbeats from server
    this.heartbeatCheckTimer = setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;
      
      if (timeSinceLastHeartbeat > this.heartbeatInterval + 5000) { // Add 5s grace period
        this.missedHeartbeats++;
        console.log(`[WebSocket] ❤️💔 Missed heartbeat #${this.missedHeartbeats} (${timeSinceLastHeartbeat}ms since last)`);
        
        if (this.missedHeartbeats >= this.MAX_MISSED_HEARTBEATS) {
          console.log('[WebSocket] 💔 Connection considered stale, initiating reconnection');
          this.handleStaleConnection();
        }
      }
    }, this.heartbeatInterval);
  }

  // Start sending heartbeats to server
  private startHeartbeatSending(): void {
    // Clear any existing heartbeat send timer
    if (this.heartbeatSendTimer) {
      clearInterval(this.heartbeatSendTimer);
    }

    // Send heartbeat to server periodically
    this.heartbeatSendTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const pingMessage = {
          type: 'heartbeat',
          event: 'ping',
          timestamp: new Date().toISOString()
        };
        
        console.log('[WebSocket] ❤️ Sending heartbeat ping');
        this.ws.send(JSON.stringify(pingMessage));
      }
    }, this.heartbeatInterval);
  }

  private handleStaleConnection(): void {
    this.disconnect(true); // Force disconnect
    
    // Attempt to reconnect if we have a conversation ID
    if (this.conversationId) {
      console.log('[WebSocket] 🔄 Attempting to reconnect due to stale connection');
      this.connect(this.conversationId, this.conversationType === 'group');
    }
  }

  private stopHeartbeatMonitoring(): void {
    if (this.heartbeatCheckTimer) {
      clearInterval(this.heartbeatCheckTimer);
      this.heartbeatCheckTimer = null;
    }
  }

  private stopHeartbeatSending(): void {
    if (this.heartbeatSendTimer) {
      clearInterval(this.heartbeatSendTimer);
      this.heartbeatSendTimer = null;
    }
  }

  private handleHeartbeatMessage(data: WebSocketMessage): void {
    this.lastHeartbeat = Date.now();
    this.missedHeartbeats = 0;
    
    // If this is a ping, send a pong response
    if (data.event === 'ping' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const pongMessage = {
        type: 'heartbeat',
        event: 'pong',
        timestamp: new Date().toISOString()
      };
      
      console.log('[WebSocket] ❤️ Responding to heartbeat ping with pong');
      this.ws.send(JSON.stringify(pongMessage));
    } else if (data.event === 'pong') {
      console.log('[WebSocket] ❤️ Received heartbeat pong response');
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
    console.log(`[WebSocket] 🎯 Will attempt to reconnect to conversation: ${this.conversationId} (${this.conversationType})`);
    
    setTimeout(() => {
      if (this.conversationId && this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log(`[WebSocket] 🔄 Executing reconnect attempt ${this.reconnectAttempts}`);
        this.connect(this.conversationId, this.conversationType === 'group');
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

  // Enhanced message event handler to match new backend
  private handleMessageEvent = (event: MessageEvent) => {
    try {
      this.messagesReceivedCount++;
      const data: WebSocketMessage = JSON.parse(event.data);
      
      console.log(`[WebSocket] 📨 Message received (#${this.messagesReceivedCount}):`, data);
      console.log(`[WebSocket] 📊 Message type: ${data.type}, Event: ${data.event || 'N/A'}`);
      
      // Handle heartbeat messages first
      if (data.type === 'heartbeat') {
        this.handleHeartbeatMessage(data);
        return; // Don't propagate heartbeat messages to callbacks
      }
      
      // Handle error messages
      if (data.error) {
        console.error(`[WebSocket] ❌ Server error received:`, data.error);
        // Still propagate error messages to callbacks for handling
      }
      
      // Handle different message types with enhanced logging
      switch (data.type) {
        case 'chat.message':
          if (data.message) {
            console.log(`[WebSocket] 💬 New message from ${data.message.sender_name}: "${data.message.content?.substring(0, 50)}${(data.message.content?.length || 0) > 50 ? '...' : ''}"`);
          }
          break;
          
        case 'typing.indicator':
          console.log(`[WebSocket] ⌨️ Typing indicator from ${data.username}: ${data.is_typing ? 'started' : 'stopped'}`);
          break;
          
        case 'read.receipt':
          console.log(`[WebSocket] 👁️ Read receipt from ${data.read_by_user || data.username} for message ${data.message_id}`);
          break;
          
        case 'message.reaction':
          console.log(`[WebSocket] 👍 Reaction ${data.action}: "${data.emoji || data.reaction}" on message ${data.message_id}`);
          break;
          
        case 'user.online':
        case 'user.offline':
          console.log(`[WebSocket] 👤 Presence update: ${data.username} is ${data.type.split('.')[1]} ${data.last_seen ? `(last seen: ${data.last_seen})` : ''}`);
          break;
          
        default:
          console.log(`[WebSocket] ❓ Unknown message type: ${data.type}`);
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
