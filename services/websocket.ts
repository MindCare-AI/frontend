import { useEffect, useRef, useCallback } from 'react';
import { WS_BASE_URL } from '../config';
import { getAuthToken } from '../utils/auth';
import * as NetInfo from "@react-native-community/netinfo";
import type { NetInfoState } from "@react-native-community/netinfo";

interface WebSocketMessage {
  type: string;
  data?: any;
}

interface WebSocketHook {
  sendMessage: (message: WebSocketMessage) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
}

// This is your dedicated connectWebSocket utility.
export const connectWebSocket = (
  conversationId: string,
  token: string,
  onMessageReceived: (message: any) => void,
  onTypingIndicator?: (data: any) => void,
  onReadReceipt?: (data: any) => void
): WebSocket => {
  const socket = new WebSocket(`${WS_BASE_URL}/ws/messaging/${conversationId}/?token=${token}`);

  socket.onopen = () => {
    console.log('[WS] Connection established for conversation', conversationId);
    // Send join message to ensure we're connected to the room
    socket.send(JSON.stringify({ 
      type: 'join', 
      data: { conversation_id: conversationId } 
    }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[WS Utility] Raw message:', data);

      // Handle standardized message format
      if (data.type === 'conversation_message') {
        console.log('[WS Utility] New message event received.');
        onMessageReceived({
          id: data.id,
          content: data.content,
          sender: data.sender,
          timestamp: data.timestamp,
          status: 'sent',
          conversation: data.conversation
        });
      }
      // Handle all message types
      else if (data.type === 'conversation_message' && data.message) {
        console.log('[WS] Processing conversation_message:', data.message);
        onMessageReceived(data.message);
      } 
      else if (data.type === 'new_message' && data.data) {
        console.log('[WS] Processing new_message:', data.data);
        onMessageReceived(data.data);
      }
      else if (data.type === 'message_create' || data.type === 'message_update') {
        console.log('[WS] Processing message event:', data);
        // Extract the message from whatever format it's in
        const messageData = data.message || data.data || data;
        onMessageReceived(messageData);
      }
      else if (data.type === 'typing_indicator' && onTypingIndicator) {
        onTypingIndicator(data);
      }
      else if (data.type === 'read_receipt' && onReadReceipt) {
        onReadReceipt(data);
      }
      else if (data.type === 'connection_established') {
        console.log('[WS] Connection confirmed for conversation', conversationId);
      }
      else {
        // Try to identify any message-like structure
        console.log('[WS] Unhandled message type:', data.type);
        if (data.id && (data.content || data.message)) {
          const messageData = data.message || data;
          onMessageReceived(messageData);
        }
      }
    } catch (error) {
      console.error('[WS] Error processing message:', error);
    }
  };

  socket.onerror = (error) => {
    console.error('[WS] WebSocket error:', error);
  };

  socket.onclose = (event) => {
    console.log('[WS] Connection closed for conversation', conversationId, 'Code:', event.code);
  };

  return socket;
};

// The hook now uses connectWebSocket and does not override its events.
export const useWebSocket = (
  conversationId: string,
  onMessageReceived: (data: any) => void
): WebSocketHook => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000; 
  const onMessageReceivedRef = useRef(onMessageReceived);
  const connectionStatusRef = useRef<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Update the message callback ref on change.
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const connect = useCallback(() => {
    if (!conversationId) {
      console.warn('Missing conversation ID');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      console.error('No authentication token available');
      return; 
    }

    connectionStatusRef.current = 'connecting';

    // Call our utility. Note: Provide a dummy for onTypingIndicator if needed.
    ws.current = connectWebSocket(
      conversationId,
      token,
      (msg) => {
        console.log('[WS Hook] onMessageReceived invoked with:', msg);
        onMessageReceivedRef.current(msg);
      },
      (data) => {
        console.log('[WS Hook] Typing indicator:', data);
      },
      (data) => {
        console.log('[WS Hook] Read receipt:', data);
      }
    );

    ws.current.onclose = (event) => {
      connectionStatusRef.current = 'disconnected';
      if (event.code !== 1000) {
        console.warn(`WebSocket closed unexpectedly. Code: ${event.code}`);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`);
          setTimeout(connect, reconnectDelay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error (hook):', error);
    };

    ws.current.onopen = () => {
      console.log(`[WS Hook] Connected to conversation ${conversationId}`);
      connectionStatusRef.current = 'connected';
      reconnectAttempts.current = 0;
    };
  }, [conversationId]);

  // Connect on mount and when conversationId changes.
  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        console.log('[WS Hook] Closing WebSocket on component unmount');
        ws.current.close(1000, 'Component unmounted');
        ws.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }, []);

  // Heartbeat to keep the connection alive
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'heartbeat' });
      }
    }, 30000); // every 30 seconds
    return () => clearInterval(heartbeatInterval);
  }, [sendMessage]);

  // Add NetInfo listener for reconnection
  useEffect(() => {
    const handleNetworkChange = (state: NetInfoState) => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      if (state.isConnected && !ws.current) {
        connect();
      }
    };

    const unsubscribe = (NetInfo as any).addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, [connect]);

  return {
    sendMessage,
    connectionStatus: connectionStatusRef.current,
  };
};