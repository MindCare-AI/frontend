import { useState, useEffect, useCallback, useRef } from 'react';
import { sendMessage as apiSendMessage, getMessages } from '../API/conversations';
import websocketService from '../services/websocketService';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string | number;
  content: string;
  sender_id: string | number;
  sender_name: string;
  timestamp: string;
  message_type: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  is_bot?: boolean;
}

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  sendTyping: (isTyping: boolean) => void;
  retryMessage: (messageId: string | number) => Promise<void>;
  isConnected: boolean;
  retryConnection: () => Promise<void>;
}

export const useMessages = (conversationId: string | number): UseMessagesReturn => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const wsMessageHandler = useRef<(() => void) | null>(null);
  const wsConnectionHandler = useRef<(() => void) | null>(null);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`[useMessages] Loading messages for conversation: ${conversationId}`);
        
        const response = await getMessages(conversationId);
        const messageList = response.results || [];
        
        // Ensure messages are in ascending order by timestamp and have proper sender_id mapping
        const sortedMessages = messageList
          .map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id || msg.sender || (msg.sender_detail ? msg.sender_detail.id : null),
            sender_name: msg.sender_name || (msg.sender_detail ? msg.sender_detail.username : 'Unknown'),
            timestamp: msg.timestamp,
            message_type: msg.message_type || 'text',
            status: 'sent' as const,
            is_bot: msg.is_bot || false,
          }))
          .sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        console.log(`[useMessages] Loaded ${sortedMessages.length} messages`);
        console.log(`[useMessages] First message sender_id:`, sortedMessages[0]?.sender_id);
        console.log(`[useMessages] Current user ID:`, user?.id);
        setMessages(sortedMessages);
      } catch (err) {
        console.error('[useMessages] Error loading messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId, user?.id]);

  // Setup WebSocket connection and message handlers
  useEffect(() => {
    console.log(`[useMessages] Setting up WebSocket for conversation: ${conversationId}`);

    // Message handler
    const handleMessage = (data: any) => {
      console.log(`[useMessages] Received WebSocket message:`, data);

      if (data.type === 'message' && data.event === 'new_message' && data.message) {
        const newMessage: Message = {
          id: data.message.id,
          content: data.message.content,
          sender_id: data.message.sender_id || data.message.sender,
          sender_name: data.message.sender_name || data.message.sender_username || 'Unknown',
          timestamp: data.message.timestamp,
          message_type: data.message.message_type || 'text',
          status: 'sent',
          is_bot: data.message.is_bot || false,
        };

        console.log(`[useMessages] Adding new message to state:`, newMessage);
        console.log(`[useMessages] New message sender_id:`, newMessage.sender_id);

        // Only add if it's for the current conversation and not a duplicate
        if (data.message.conversation_id === conversationId.toString()) {
          setMessages(prevMessages => {
            // Check if message already exists
            const exists = prevMessages.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log(`[useMessages] Message ${newMessage.id} already exists, skipping`);
              return prevMessages;
            }

            console.log(`[useMessages] Adding message ${newMessage.id} to conversation ${conversationId}`);
            // Add to the end to maintain chronological order
            return [...prevMessages, newMessage];
          });
        }
      } else if (data.type === 'typing') {
        // Handle typing indicators from other users
        if (data.user_id !== user?.id?.toString()) {
          setIsTyping(data.is_typing || false);
          console.log(`[useMessages] Typing indicator: ${data.is_typing ? 'started' : 'stopped'} by ${data.username}`);
        }
      }
    };

    // Connection status handler
    const handleConnectionChange = (connected: boolean) => {
      console.log(`[useMessages] Connection status changed: ${connected}`);
      setIsConnected(connected);
    };

    // Subscribe to WebSocket events
    wsMessageHandler.current = websocketService.onMessage(handleMessage);
    wsConnectionHandler.current = websocketService.onConnectionChange(handleConnectionChange);

    // Initial connection status
    setIsConnected(websocketService.isConnected());

    // Cleanup on unmount
    return () => {
      console.log(`[useMessages] Cleaning up WebSocket handlers for conversation: ${conversationId}`);
      if (wsMessageHandler.current) {
        wsMessageHandler.current();
        wsMessageHandler.current = null;
      }
      if (wsConnectionHandler.current) {
        wsConnectionHandler.current();
        wsConnectionHandler.current = null;
      }
    };
  }, [conversationId, user?.id]);

  // Send message function
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim()) return;

    console.log(`[useMessages] Sending message: "${content}"`);

    // Create temporary message for immediate UI feedback
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      sender_id: user?.id || '',
      sender_name: user?.username || 'You',
      timestamp: new Date().toISOString(),
      message_type: 'text',
      status: 'sending',
    };

    // Add temp message to UI (at the end to maintain chronological order)
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Send via API (which will use WebSocket if available)
      const response = await apiSendMessage(conversationId, content);
      console.log(`[useMessages] Message sent successfully:`, response);

      // Update temp message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, id: response.id || msg.id, status: 'sent' }
            : msg
        )
      );
    } catch (error) {
      console.error(`[useMessages] Failed to send message:`, error);
      
      // Update temp message status to failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      
      throw error;
    }
  }, [conversationId, user]);

  // Send typing indicator
  const sendTyping = useCallback((typing: boolean) => {
    console.log(`[useMessages] Sending typing indicator: ${typing}`);
    try {
      websocketService.sendTyping(typing);
    } catch (error) {
      console.error('[useMessages] Failed to send typing indicator:', error);
    }
  }, []);

  // Retry failed message
  const retryMessage = useCallback(async (messageId: string | number): Promise<void> => {
    console.log(`[useMessages] Retrying message: ${messageId}`);
    
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    // Update message status to sending
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sending' } : msg
      )
    );

    try {
      await sendMessage(message.content);
      
      // Remove the failed message since sendMessage will add a new one
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      // Revert to failed status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'failed' } : msg
        )
      );
      throw error;
    }
  }, [messages, sendMessage]);

  // Retry WebSocket connection
  const retryConnection = useCallback(async (): Promise<void> => {
    console.log(`[useMessages] Retrying WebSocket connection for conversation: ${conversationId}`);
    try {
      await websocketService.connect(conversationId.toString());
    } catch (error) {
      console.error('[useMessages] Failed to retry connection:', error);
      throw error;
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    isTyping,
    sendMessage,
    sendTyping,
    retryMessage,
    isConnected,
    retryConnection,
  };
};
