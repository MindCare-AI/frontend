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

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private options: WebSocketOptions;

  constructor(options: WebSocketOptions) {
    this.options = options;
  }

  connect(userId: string, token: string) {
    try {
      this.ws = new WebSocket(`${API_URL}/ws/?token=${token}`);
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 1000;
        this.options.onConnectionChange?.('connected');
        this.startPingInterval();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.options.onMessage?.(data);
        } catch (error) {
          console.error('Error parsing websocket message:', error);
        }
      };

      this.ws.onclose = () => {
        this.options.onConnectionChange?.('disconnected');
        this.stopPingInterval();
        this.handleDisconnect();
      };

      this.ws.onerror = (error) => {
        this.options.onError?.(error as Error);
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleDisconnect();
    }
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.options.onConnectionChange?.('reconnecting');
      setTimeout(() => {
        this.reconnectAttempts++;
        this.reconnectTimeout *= 2;
        getAuthToken().then(token => {
          if (token) {
            AsyncStorage.getItem('userId').then(userId => {
              if (userId) this.connect(userId, token);
            });
          }
        });
      }, this.reconnectTimeout);
    } else {
      this.options.onError?.(new Error('Max reconnection attempts reached'));
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  sendMessage(message: Partial<Message>) {
    this.send({
      type: 'message',
      payload: message,
    });
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean) {
    this.send({
      type: 'typing',
      payload: {
        conversationId,
        isTyping,
        timestamp: new Date().toISOString(),
      },
    });
  }

  sendReadReceipt(messageId: string, conversationId: string) {
    this.send({
      type: 'read_receipt',
      payload: {
        messageId,
        conversationId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  disconnect() {
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const useWebSocket = (
  channel: string,
  onMessage?: (data: any) => void
) => {
  const wsRef = useRef<WebSocketService | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    wsRef.current = new WebSocketService({
      onMessage,
      onConnectionChange: setConnectionStatus,
      onError: (error) => console.error(`WebSocket error in ${channel}:`, error),
    });

    const connect = async () => {
      const [userId, token] = await Promise.all([
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('accessToken'),
      ]);

      if (userId && token) {
        wsRef.current?.connect(userId, token);
      }
    };

    connect();

    return () => {
      wsRef.current?.disconnect();
    };
  }, [channel, onMessage]);

  const sendMessage = useCallback((data: any) => {
    try {
      wsRef.current?.send(data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, []);

  return {
    sendMessage,
    connectionStatus,
  };
};