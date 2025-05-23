import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import websocketService, { WebSocketMessage } from '../services/websocketService';
import { getMessages, sendMessage as apiSendMessage, markMessageAsRead } from '../API/conversations';

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

export const useMessages = (conversationId: string | number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const connectionAttemptRef = useRef<boolean>(false);

  // Connect to WebSocket when conversation changes
  useEffect(() => {
    if (conversationId) {
      connectionAttemptRef.current = true;
      connectToConversation();
    }

    return () => {
      if (connectionAttemptRef.current) {
        console.log(`[useMessages] 🧹 Cleaning up connection state for conversation: ${conversationId}`);
        // We don't disconnect - we're keeping connection alive
        connectionAttemptRef.current = false;
      }
    };
  }, [conversationId]);

  // Set up WebSocket message listeners
  useEffect(() => {
    const unsubscribeMessage = websocketService.onMessage(handleWebSocketMessage);
    const unsubscribeConnection = websocketService.onConnectionChange(handleConnectionChange);
    
    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
    };
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    console.log(`[useMessages] 🔗 Connection status changed: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
    setIsConnected(connected);
  }, []);

  const connectToConversation = async () => {
    console.group(`[useMessages] 🔗 Connecting to conversation: ${conversationId}`);
    
    try {
      setLoading(true);
      setError(null);
      
      // First check if we're already connected to this conversation
      const currentConvoId = websocketService.getCurrentConversationId();
      const isAlreadyConnected = websocketService.isConnected() && 
                               currentConvoId === conversationId.toString();
                               
      if (isAlreadyConnected) {
        console.log(`[useMessages] ✓ Already connected to conversation ${conversationId}`);
        setIsConnected(true);
      } else {
        // Load existing messages first
        console.log(`[useMessages] 📋 Loading existing messages...`);
        const messagesData = await getMessages(conversationId);
        if (messagesData?.results) {
          console.log(`[useMessages] ✅ Loaded ${messagesData.results.length} existing messages`);
          setMessages(messagesData.results);
        }
        
        console.log(`[useMessages] 🌐 Connecting to WebSocket...`);
        
        try {
          // Add a connection timeout
          const connectionPromise = websocketService.connect(conversationId.toString());
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 15000)
          );
          
          await Promise.race([connectionPromise, timeoutPromise]);
          
          console.log(`[useMessages] ✅ WebSocket connected successfully`);
          
          // Verify connection status with a slight delay to ensure state is updated
          setTimeout(() => {
            const isConnected = websocketService.isConnected();
            const currentConvId = websocketService.getCurrentConversationId();
            console.log(`[useMessages] 🔍 Post-connection verification: Connected=${isConnected}, ConvId=${currentConvId}`);
            
            if (isConnected && currentConvId === conversationId.toString()) {
              setIsConnected(true);
              console.log(`[useMessages] ✅ WebSocket connection verified and ready`);
            } else {
              console.warn(`[useMessages] ⚠️ WebSocket connection verification failed`);
              setIsConnected(false);
            }
          }, 1000);
          
        } catch (wsError) {
          console.error(`[useMessages] ❌ WebSocket connection failed:`, wsError);
          console.log(`[useMessages] 📋 Will use REST API for messaging`);
          setIsConnected(false);
        }
      }
      
      // Log final connection status
      const finalStats = websocketService.getConnectionStats();
      console.log(`[useMessages] 📊 Final connection stats:`, finalStats);
      
    } catch (err) {
      console.error('[useMessages] ❌ Error in connectToConversation:', err);
      setError('Failed to load messages');
      setIsConnected(false);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  // Retry connection function
  const retryConnection = useCallback(async () => {
    console.log(`[useMessages] 🔄 Retrying WebSocket connection for conversation: ${conversationId}`);
    
    // Disconnect first to clean up
    websocketService.disconnect();
    
    // Wait a bit before reconnecting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Attempt to reconnect
    try {
      await websocketService.connect(conversationId.toString());
      setIsConnected(true);
      console.log(`[useMessages] ✅ WebSocket reconnection successful`);
    } catch (error) {
      console.error(`[useMessages] ❌ WebSocket reconnection failed:`, error);
      setIsConnected(false);
    }
  }, [conversationId]);

  const handleWebSocketMessage = useCallback((wsMessage: WebSocketMessage) => {
    console.group(`[useMessages] 📨 WebSocket message received`);
    console.log('Message type:', wsMessage.type);
    console.log('Message data:', wsMessage);

    switch (wsMessage.type) {
      case 'message':
        if (wsMessage.event === 'new_message' && wsMessage.message) {
          console.log(`[useMessages] 💬 Processing new message from WebSocket`);
          handleNewMessage(wsMessage.message);
        }
        break;
        
      case 'typing':
        console.log(`[useMessages] ⌨️ Processing typing indicator`);
        handleTypingIndicator(wsMessage);
        break;
        
      case 'read':
        if (wsMessage.message_id) {
          console.log(`[useMessages] 👁️ Processing read receipt for message: ${wsMessage.message_id}`);
          handleReadReceipt(wsMessage.message_id, wsMessage.user_id || '');
        }
        break;
        
      case 'reaction':
        if (wsMessage.message_id && wsMessage.reaction) {
          console.log(`[useMessages] 👍 Processing reaction: ${wsMessage.reaction} for message: ${wsMessage.message_id}`);
          handleReaction(wsMessage.message_id, wsMessage.reaction, wsMessage.action || 'add', wsMessage.user_id || '');
        }
        break;
        
      case 'presence':
        console.log(`[useMessages] 👤 Processing presence update`);
        handlePresence(wsMessage);
        break;
        
      default:
        console.warn(`[useMessages] ❓ Unknown WebSocket message type: ${wsMessage.type}`);
    }
    
    console.groupEnd();
  }, []);

  const handleNewMessage = useCallback((messageData: any) => {
    console.log(`[useMessages] 📥 Adding new message from WebSocket to UI`);
    console.log('Message data:', messageData);
    console.log('Current user ID:', user?.id, 'type:', typeof user?.id);
    console.log('Message sender ID:', messageData.sender_id, 'type:', typeof messageData.sender_id);
    
    const newMessage: Message = {
      id: messageData.id,
      content: messageData.content,
      sender_id: messageData.sender_id,
      sender_name: messageData.sender_name,
      timestamp: messageData.timestamp,
      message_type: messageData.message_type || 'text',
      status: 'sent',
      is_bot: messageData.is_bot || false
    };

    console.log(`[useMessages] 🔍 Message comparison:`, {
      messageId: newMessage.id,
      messageSenderId: newMessage.sender_id,
      currentUserId: user?.id,
      isOwnMessage: newMessage.sender_id?.toString() === user?.id?.toString(),
      isBot: newMessage.is_bot
    });

    setMessages(prevMessages => {
      // Check if message already exists (avoid duplicates)
      const exists = prevMessages.some(msg => msg.id === newMessage.id);
      if (exists) {
        console.log(`[useMessages] 🔄 Updating existing message: ${newMessage.id}`);
        return prevMessages.map(msg => 
          msg.id === newMessage.id ? newMessage : msg
        );
      }
      console.log(`[useMessages] ➕ Adding new message to list: ${newMessage.id}`);
      return [...prevMessages, newMessage];
    });

    // Mark as read if not from current user
    if (messageData.sender_id?.toString() !== user?.id?.toString()) {
      console.log(`[useMessages] 👁️ Marking message as read (not from current user)`);
      markMessageAsRead(messageData.id);
    }
  }, [user?.id]);

  const handleTypingIndicator = useCallback((wsMessage: WebSocketMessage) => {
    if (wsMessage.user_id !== user?.id?.toString()) {
      setIsTyping(wsMessage.is_typing || false);
      
      // Clear typing indicator after a delay
      if (wsMessage.is_typing) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    }
  }, [user?.id]);

  const handleReadReceipt = useCallback((messageId: string, userId: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id.toString() === messageId && msg.sender_id === user?.id?.toString()
          ? { ...msg, status: 'read' }
          : msg
      )
    );
  }, [user?.id]);

  const handleReaction = useCallback((messageId: string, reaction: string, action: string, userId: string) => {
    // Handle reactions if your message model supports them
    console.log('Reaction received:', { messageId, reaction, action, userId });
  }, []);

  const handlePresence = useCallback((wsMessage: WebSocketMessage) => {
    if (wsMessage.event === 'online' && wsMessage.user_id) {
      setOnlineUsers(prev => [...prev.filter(id => id !== wsMessage.user_id), wsMessage.user_id!]);
    } else if (wsMessage.event === 'offline' && wsMessage.user_id) {
      setOnlineUsers(prev => prev.filter(id => id !== wsMessage.user_id));
    }
  }, []);

  const sendMessage = useCallback(async (content: string, attachments: any[] = []) => {
    if (!content.trim()) return;

    const messageId = `temp-${Date.now()}`;
    console.group(`[useMessages] 📤 Sending message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);

    try {
      // Add optimistic message to UI
      const optimisticMessage: Message = {
        id: messageId,
        content,
        sender_id: user?.id || '',
        sender_name: user?.username || 'You',
        timestamp: new Date().toISOString(),
        message_type: 'text',
        status: 'sending'
      };

      setMessages(prev => [...prev, optimisticMessage]);
      console.log(`[useMessages] ✅ Optimistic message added to UI with ID: ${messageId}`);

      // Always try WebSocket first, if not connected, try to connect
      let isWebSocketConnected = websocketService.isConnected();
      let currentConversationId = websocketService.getCurrentConversationId();
      let isCorrectConversation = currentConversationId === conversationId.toString();

      // If not connected or wrong conversation, try to connect
      if (!isWebSocketConnected || !isCorrectConversation) {
        console.log(`[useMessages] 🔄 WS not ready, attempting connect before sending`);
        try {
          await websocketService.connect(conversationId.toString());
          console.log(`[useMessages] ✅ WS connection established`);
          isWebSocketConnected = true;
          isCorrectConversation = true;
        } catch (error) {
          console.log(`[useMessages] ❌ WS connection failed:`, error);
        }
      }

      console.log(`[useMessages] 🔍 WebSocket Status Check:`);
      console.log(`  • Connected: ${isWebSocketConnected}`);
      console.log(`  • Current conversation: ${currentConversationId}`);
      console.log(`  • Target conversation: ${conversationId}`);
      console.log(`  • Conversation match: ${isCorrectConversation}`);

      // Send via WebSocket if connected, otherwise use REST API
      if (isWebSocketConnected && isCorrectConversation) {
        console.log(`[useMessages] 🌐 Sending via WebSocket...`);
        
        try {
          websocketService.sendMessage({
            content,
            message_type: 'text',
            metadata: { timestamp: new Date().toISOString() }
          });
          
          console.log(`[useMessages] ✅ Message sent via WebSocket successfully`);
          console.log(`[useMessages] ⏳ Waiting for WebSocket confirmation...`);
          
          // Update status to indicate it was sent via WebSocket
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, status: 'sent' }
                : msg
            )
          );
          
        } catch (wsError) {
          console.error(`[useMessages] ❌ WebSocket send failed:`, wsError);
          console.log(`[useMessages] 🔄 Falling back to REST API...`);
          throw wsError; // This will trigger the REST API fallback
        }
        
      } else {
        console.log(`[useMessages] 🌐 Sending via REST API...`);
        console.log(`[useMessages] 📍 Reason: ${!isWebSocketConnected ? 'WebSocket not connected' : 'Wrong conversation'}`);
        
        // If WebSocket is not connected, try to reconnect in the background
        if (!isWebSocketConnected) {
          console.log(`[useMessages] 🔄 Attempting background WebSocket reconnection...`);
          retryConnection().catch(err => 
            console.warn(`[useMessages] ⚠️ Background reconnection failed:`, err)
          );
        }
        
        const response = await apiSendMessage(conversationId, content, false, attachments);
        
        console.log(`[useMessages] ✅ Message sent via REST API successfully`);
        console.log(`[useMessages] 📨 API Response:`, response);
        
        // Update the optimistic message with the real response
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, id: (response as any).id, status: 'sent' }
              : msg
          )
        );
      }

    } catch (error) {
      console.error('[useMessages] ❌ Error sending message:', error);
      
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
    } finally {
      console.groupEnd();
    }
  }, [conversationId, user, retryConnection]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (websocketService.isConnected()) {
      websocketService.sendTyping(isTyping);
    }
  }, []);

  const retryMessage = useCallback(async (messageId: string | number) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    // Update status to sending
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sending' } : msg
      )
    );

    try {
      await sendMessage(message.content);
      
      // Remove the failed message since a new one will be added
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      // Mark as failed again
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'failed' } : msg
        )
      );
    }
  }, [messages, sendMessage]);

  return {
    messages,
    loading,
    error,
    isTyping,
    onlineUsers,
    sendMessage,
    sendTyping,
    retryMessage,
    isConnected,
    retryConnection
  };
};
