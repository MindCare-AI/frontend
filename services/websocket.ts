import React from 'react';
import { useEffect, useRef, useCallback, useState } from 'react';
import { API_URL } from '../config';
import { getAuthToken } from '../lib/utils';
import NetInfo from "@react-native-community/netinfo";
import { EventEmitter } from 'events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, TypingIndicator, ReadReceipt, ConnectionStatus } from '../types/chat';

export enum WebSocketEvent {
  MESSAGE = 'message',
  TYPING = 'typing',
  READ_RECEIPT = 'read_receipt',
  REACTION = 'reaction',
  ERROR = 'error',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

interface WebSocketOptions {
  onMessage?: (data: any) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
  onError?: (error: Error) => void;
}

class ChatWebSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  
  constructor() {
    super();
    this.url = process.env.WEBSOCKET_URL || 'wss://api.example.com/ws';
  }

  connect(token: string) {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(`${this.url}?token=${token}`);
    
    this.ws.onopen = () => {
      this.emit(WebSocketEvent.CONNECTED);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.ws.onclose = () => {
      this.emit(WebSocketEvent.DISCONNECTED);
    };

    this.ws.onerror = (error) => {
      this.emit(WebSocketEvent.ERROR, error);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  sendTypingIndicator(isTyping: boolean, conversationId: string) {
    this.sendMessage({
      type: isTyping ? 'typing_started' : 'typing_stopped',
      payload: { conversation_id: conversationId }
    });
  }

  sendReadReceipt(messageId: string, conversationId: string) {
    this.sendMessage({
      type: 'read_receipt',
      payload: { message_id: messageId, conversation_id: conversationId }
    });
  }

  sendReaction(messageId: string, reaction: string) {
    this.sendMessage({
      type: 'reaction',
      payload: { message_id: messageId, reaction }
    });
  }
}

export const chatWebSocket = new ChatWebSocket();
export default chatWebSocket;

export const useWebSocket = (
  channel: string,
  onMessage?: (data: any) => void
) => {
  const wsRef = useRef<ChatWebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    wsRef.current = new ChatWebSocket();

    const connect = async () => {
      const [userId, token] = await Promise.all([
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('accessToken'),
      ]);

      if (userId && token) {
        wsRef.current?.connect(token);
      }
    };

    connect();

    return () => {
      wsRef.current?.disconnect();
    };
  }, [channel, onMessage]);

  const sendMessage = useCallback((data: any) => {
    try {
      wsRef.current?.sendMessage(data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, []);

  return {
    sendMessage,
    connectionStatus,
  };
};