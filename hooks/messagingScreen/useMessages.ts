import { useState, useEffect, useCallback, useRef } from 'react';
import { sendMessage as apiSendMessage, getConversationById } from '../../API/conversations';
import websocketService from '../../services/websocketService';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        
        // First, determine if this is a group or one-to-one conversation
        let isGroup = false;
        let endpoint = '';
        
        try {
          // Try to get conversation details to determine type
          const conversationDetails = await getConversationById(conversationId);
          isGroup = conversationDetails.is_group || false;
          console.log(`[useMessages] Conversation ${conversationId} is ${isGroup ? 'group' : 'one-to-one'}`);
        } catch (error) {
          console.warn(`[useMessages] Could not determine conversation type, defaulting to one-to-one:`, error);
          isGroup = false;
        }

        // Use the appropriate endpoint based on conversation type
        endpoint = isGroup 
          ? `${API_URL}/messaging/groups/${conversationId}/`
          : `${API_URL}/messaging/one_to_one/${conversationId}/`;

        console.log(`[useMessages] Using endpoint: ${endpoint}`);

        const token = await AsyncStorage.getItem('accessToken');
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch conversation data: ${response.status}`);
        }

        const conversationData = await response.json();
        const messageList = conversationData.messages || [];
        
        console.log(`[useMessages] Conversation data:`, conversationData);
        console.log(`[useMessages] Raw messages:`, messageList);

        // Map messages to our Message interface
        const sortedMessages = messageList
          .map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender, // API uses 'sender' field
            sender_name: msg.sender_name || 'Unknown', // May need to fetch from participants
            timestamp: msg.timestamp,
            message_type: msg.message_type || 'text',
            status: 'sent' as const,
            is_bot: msg.is_bot || false,
          }))
          .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
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
            // Check if message already exists by ID
            const existsById = prevMessages.some(msg => msg.id === newMessage.id);
            if (existsById) {
              console.log(`[useMessages] Message ${newMessage.id} already exists by ID, skipping`);
              return prevMessages;
            }
            
            // Check if we have a temporary message with matching content and sender that should be replaced
            // This handles the case where we already added a temp message but now received the real one
            const tempMessageIndex = prevMessages.findIndex(msg => 
              msg.id.toString().startsWith('temp-') && 
              msg.content === newMessage.content && 
              msg.sender_id.toString() === newMessage.sender_id.toString()
            );
            
            if (tempMessageIndex !== -1) {
              console.log(`[useMessages] Found temporary message to replace with ID ${prevMessages[tempMessageIndex].id}`);
              // Replace the temporary message with the real one from the server
              return prevMessages.map((msg, idx) => 
                idx === tempMessageIndex ? newMessage : msg
              );
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

    // Generate a unique, timestamped ID for the temporary message
    const tempId = `temp-${Date.now()}`;
    
    // Create temporary message for immediate UI feedback
    const tempMessage: Message = {
      id: tempId,
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
      
      // Only update the temp message if it still exists and hasn't been replaced by WebSocket
      setMessages(prev => {
        // Check if the temp message still exists or if WebSocket already replaced it
        const tempMessageExists = prev.some(msg => msg.id === tempId);
        
        if (tempMessageExists) {
          console.log(`[useMessages] Updating temporary message ${tempId} with server response`);
          return prev.map(msg => 
            msg.id === tempId
              ? { ...msg, id: response.id || msg.id, status: 'sent' }
              : msg
          );
        } else {
          console.log(`[useMessages] Temporary message ${tempId} already processed by WebSocket`);
          return prev;
        }
      });
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
      // Generate a new temporary ID for the retry to avoid conflicts
      const originalMessageContent = message.content;
      
      // Remove the failed message before sending to avoid duplication
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Now send the message with fresh temporary ID
      await sendMessage(originalMessageContent);
    } catch (error) {
      // If sending fails again, restore the failed message
      setMessages(prev => {
        // Check if the message still exists (might have been replaced by WebSocket response)
        const exists = prev.some(msg => msg.id === messageId || 
                                       (msg.content === message.content && 
                                        msg.sender_id === message.sender_id));
        
        if (exists) {
          console.log(`[useMessages] Message already exists, not restoring failed state`);
          return prev;
        }
        
        console.log(`[useMessages] Restoring failed message: ${messageId}`);
        return [...prev, { ...message, status: 'failed' }];
      });
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
