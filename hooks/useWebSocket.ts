import { useEffect, useState, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';

type MessageHandler = (data: any) => void;
type WebSocketState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | null;

interface UseWebSocketOptions {
  onOpen?: () => void;
  onMessage?: MessageHandler;
  onError?: (error: any) => void;
  onClose?: (event: { code: number; reason: string }) => void;
  autoConnect?: boolean;
}

export const useWebSocket = (
  path: string,
  options: UseWebSocketOptions = {}
) => {
  const [state, setState] = useState<WebSocketState>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const messageHandlers = useRef<MessageHandler[]>([]);
  
  // Connect to the WebSocket
  const connect = useCallback(async () => {
    try {
      setError(null);
      setState('CONNECTING');
      
      await websocketService.connect(
        path,
        {
          onOpen: () => {
            setState('OPEN');
            if (options.onOpen) options.onOpen();
          },
          onMessage: (data) => {
            setLastMessage(data);
            if (options.onMessage) options.onMessage(data);
          },
          onError: (err) => {
            setError(err);
            if (options.onError) options.onError(err);
          },
          onClose: (evt) => {
            setState('CLOSED');
            if (options.onClose) options.onClose(evt);
          },
        }
      );
    } catch (err) {
      setError(err);
    }
  }, [path, options]);

  // Disconnect from the WebSocket
  const disconnect = useCallback(() => {
    websocketService.close();
    setState('CLOSED');
  }, []);

  // Send a message via the WebSocket
  const send = useCallback((message: object | string): boolean => {
    return websocketService.send(message);
  }, []);

  // Add a message handler
  const addMessageHandler = useCallback((handler: MessageHandler) => {
    websocketService.addMessageHandler(handler);
    messageHandlers.current.push(handler);
  }, []);

  // Remove a message handler
  const removeMessageHandler = useCallback((handler: MessageHandler) => {
    websocketService.removeMessageHandler(handler);
    messageHandlers.current = messageHandlers.current.filter(h => h !== handler);
  }, []);

  // Set up the connection and clean up on unmount
  useEffect(() => {
    if (options.autoConnect !== false) {
      connect();
    }

    return () => {
      // Clean up message handlers before disconnecting
      messageHandlers.current.forEach(handler => {
        websocketService.removeMessageHandler(handler);
      });
      disconnect();
    };
  }, [connect, disconnect, options.autoConnect]);

  // Refresh WebSocket connection state
  const refresh = useCallback(() => {
    const currentState = websocketService.getState();
    setState(currentState);
  }, []);

  return {
    isConnected: state === 'OPEN',
    state,
    lastMessage,
    error,
    send,
    connect,
    disconnect,
    addMessageHandler,
    removeMessageHandler,
    refresh,
  };
};