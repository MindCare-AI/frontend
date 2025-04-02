//screens/ChatScreen/hooks/useChatMessages.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../../contexts/AuthContext';
import { Message, Conversation } from '../../../types/chat';
import { API_BASE_URL } from '../../../config';
import { getAuthToken } from "../../../utils/auth";
import { connectWebSocket } from '../../../services/websocket';

// Remove the useDebounce import since we don't need it anymore

interface EditMessageParams {
  message: Message;
  onSave: (newContent: string) => Promise<void>;
}

interface AppRoutes {
  EditMessage: EditMessageParams;
}

// Dynamic endpoint helper:
const getEndpoint = (conversationType: string): string => {
  switch (conversationType) {
    case 'group':
      return 'groups';
    case 'one_to_one':
      return 'one_to_one';
    default:
      throw new Error('Invalid conversation type');
  }
};

// Update the props interface to remove 'chatbot':
interface UseChatMessagesProps {
  conversationId: string;
  conversationType: 'one_to_one' | 'group';
}

const useChatMessages = ({ conversationId, conversationType }: UseChatMessagesProps) => {
  const { accessToken, user } = useAuth();
  const navigation = useNavigation<NavigationProp<AppRoutes>>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // Remove isTyping state
  // For pagination (cursor-based)
  const [lastCursor, setLastCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  const endpoint = getEndpoint(conversationType);

  const fetchMessages = async (conversationId: string, accessToken: string): Promise<{ messages: Message[]; conversation: Conversation; cursor?: string }> => {
    // Removed chatbot branch; using default endpoint for all conversation types
    const url = `${API_BASE_URL}/api/v1/messaging/${endpoint}/messages/?conversation=${conversationId}&page_size=20`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to load messages: ${response.status}`);
    }
    const data = await response.json();
    
    let nextCursor = null;
    if (data.next) {
      try {
        const nextUrl = new URL(data.next);
        nextCursor = nextUrl.searchParams.get('cursor');
      } catch (e) {
        nextCursor = data.next;
      }
    }
    
    const messagesList = data.results || data.messages || [];
    
    return { 
      messages: messagesList.reverse(), 
      conversation: data.conversation || { id: conversationId }, 
      cursor: nextCursor 
    };
  };

  const sendMessage = async (conversationId: string, content: string, accessToken: string): Promise<Message> => {
    const payload = {
      conversation: parseInt(conversationId, 10),
      content,
      message_type: 'text'
    };
    
    const url = `${API_BASE_URL}/api/v1/messaging/${endpoint}/messages/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send message: ${errorText}`);
    }
    
    const message = await response.json();
    return message;
  };

  const deleteMessageAPI = async (messageId: string, accessToken: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messaging/${endpoint}/messages/${messageId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to delete message: ${response.status}`);
    }
  };

  const editMessageAPI = async (messageId: string, newContent: string, conversationId: string, accessToken: string): Promise<void> => {
    // Match API payload structure based on docs
    const payload = {
      conversation: parseInt(conversationId, 10),
      content: newContent,
      message_type: 'text'
    };
    
    const response = await fetch(`${API_BASE_URL}/api/v1/messaging/${endpoint}/messages/${messageId}/`, {
      method: 'PATCH', // Using PATCH instead of PUT for partial updates
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to edit message: ${errorText}`);
    }
  };

  // Load messages on mount
  useEffect(() => {
    if (accessToken && conversationId) {
      loadMessages();
    }
  }, [conversationId, accessToken]);

  const loadMessages = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const { messages: fetchedMessages, conversation: conv, cursor } = await fetchMessages(conversationId, accessToken);
      setMessages(fetchedMessages);
      setConversation(conv);
      setHasMore(!!cursor);
      setLastCursor(cursor || null);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, accessToken, endpoint]);

  // Remove the handleTyping function entirely

  // Cursor-based pagination for loading more messages
  const loadMoreMessages = async () => {
    if (!accessToken || !lastCursor || !hasMore || loading) return;
    
    try {
      setLoading(true);
      // Removed chatbot branch; always use the default URL.
      let url = `${API_BASE_URL}/api/v1/messaging/${endpoint}/messages/?conversation=${conversationId}&cursor=${lastCursor}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load more messages: ${response.status}`);
      }
      
      const data = await response.json();
      const messagesList = data.results || data.messages || [];
      
      setMessages(prev => [...prev, ...messagesList.reverse()]);
      
      if (data.cursor) {
        setLastCursor(data.cursor);
        setHasMore(true);
      } else if (data.next) {
        try {
          const nextUrl = new URL(data.next);
          const nextCursor = nextUrl.searchParams.get('cursor');
          setLastCursor(nextCursor);
          setHasMore(!!nextCursor);
        } catch (e) {
          setLastCursor(data.next);
          setHasMore(!!data.next);
        }
      } else {
        setLastCursor(null);
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Pagination error:', error);
      setError(error.message || 'Failed to load more messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !accessToken) return;
    
    const tempId = Date.now().toString();
    const newMessage: Message = {
      id: tempId,
      content: inputText,
      sender: {
        id: user?.id || 'user',
        name: user?.username || 'User', // Changed from user?.name to user?.username
      },
      timestamp: new Date().toISOString(),
      status: 'sending',
      reactions: {}
    };

    // Optimistic update
    setMessages(prev => [newMessage, ...prev]);
    setInputText('');

    try {
      const sentMessage = await sendMessage(conversationId, inputText, accessToken);
      // Update with server response
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...sentMessage, status: 'sent' } : msg
      ));
    } catch (err: any) {
      console.error('Send message error:', err);
      setError(err.message || 'Failed to send message');
      // Mark as failed for retry
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
    }
  }, [conversationId, inputText, accessToken, user, endpoint]);

  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages(prev => {
      // Filter out any temporary messages with the same ID
      const filtered = prev.filter(msg =>
        msg.id !== `temp-${newMessage.id}` && msg.id !== newMessage.id
      );
      return [newMessage, ...filtered];
    });
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const token = getAuthToken();
    if (!token) {
      console.error('No token available for WebSocket');
      return;
    }

    // Simplify this by removing typing-related functionality
    ws.current = connectWebSocket(
      conversationId,
      token,
      handleNewMessage
      // Remove typing callback parameter
    );

    return () => {
      if (ws.current) ws.current.close(1000, 'Component unmounted');
    };
  }, [conversationId, handleNewMessage]);

  return {
    messages,
    setMessages, // IMPORTANT: Expose this so ChatScreen can update messages directly
    loading,
    error,
    inputText,
    setInputText,
    handleSend,
    loadMessages,
    loadMoreMessages,
    conversation,
    hasMore,
    // Remove isTyping, setIsTyping, and handleTyping from the return object
    deleteMessage: async (messageId: string) => {
      try {
        await deleteMessageAPI(messageId, accessToken || '');
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      } catch (err: any) {
        console.error('Delete message error:', err);
        setError(err.message || 'Failed to delete message');
      }
    },
    editMessage: async (messageId: string, newContent: string) => {
      try {
        await editMessageAPI(messageId, newContent, conversationId, accessToken || '');
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, content: newContent, is_edited: true } : msg
        ));
      } catch (err: any) {
        console.error('Edit message error:', err);
        setError(err.message || 'Failed to edit message');
      }
    }
  };
};

export default useChatMessages;
