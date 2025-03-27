// utils/websocket.ts
import { useEffect, useRef } from 'react';
import { WS_BASE_URL } from '../config';

type MessageHandler = (data: any) => void;
type ErrorHandler = (error: Event) => void;

interface WebSocketOptions {
  onMessage: MessageHandler;
  onError?: ErrorHandler;
  onOpen?: () => void;
  onClose?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

/**
 * Custom WebSocket hook for real-time communication
 * @param urlPath The WebSocket URL path (appended to WS_BASE_URL)
 * @param options Configuration options
 * @returns WebSocket instance and helper functions
 */
export function useWebSocket(
  urlPath: string,
  options: WebSocketOptions
) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const {
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnect = true,
    reconnectInterval = 5000,
  } = options;

  const connect = () => {
    try {
      ws.current = new WebSocket(`${WS_BASE_URL}${urlPath}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        onOpen?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        onClose?.();
        if (reconnect) {
          reconnectTimer.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  const sendMessage = (data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected. Message not sent:', data);
    }
  };

  const disconnect = () => {
    if (ws.current) {
      ws.current.close();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [urlPath]);

  return {
    sendMessage,
    disconnect,
    isConnected: () => ws.current?.readyState === WebSocket.OPEN,
  };
}

/**
 * WebSocket manager for chat functionality
 */
export class ChatWebSocket {
  private static instance: ChatWebSocket;
  private socket: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];

  private constructor() {}

  public static getInstance(): ChatWebSocket {
    if (!ChatWebSocket.instance) {
      ChatWebSocket.instance = new ChatWebSocket();
    }
    return ChatWebSocket.instance;
  }

  public connect(conversationId: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.socket = new WebSocket(`${WS_BASE_URL}/ws/chat/${conversationId}/`);

    this.socket.onopen = () => {
      console.log('Chat WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
      this.errorHandlers.forEach(handler => handler(error));
    };

    this.socket.onclose = () => {
      console.log('Chat WebSocket disconnected');
    };
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message - WebSocket not connected');
    }
  }

  public addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  public removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  public addErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  public removeErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
  }
}

export const sendWebSocketMessage = (message: any): void => {
  const chatSocket = ChatWebSocket.getInstance();
  chatSocket.sendMessage(message);
};