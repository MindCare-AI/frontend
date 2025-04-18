import { useState, useEffect, useCallback, useRef } from 'react';
import { Conversation, ConversationType, PaginatedConversationsResponse } from '../../types/chat';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { useWebSocket } from '../../services/websocket';

interface ConversationsState {
  items: Conversation[];
  isLoading: boolean;
  error: string | null;
  cursor: string | null;
  hasMore: boolean;
}

const CONVERSATIONS_PER_PAGE = 20;

export const useConversations = () => {
  const { accessToken } = useAuth();
  const [state, setState] = useState<ConversationsState>({
    items: [],
    isLoading: true,
    error: null,
    cursor: null,
    hasMore: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typingIndicators, setTypingIndicators] = useState<Map<string, Set<string>>>(new Map());
  const conversationsCache = useRef<Map<string, Conversation>>(new Map());
  const isLoadingMoreRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const { connectionStatus } = useWebSocket('global', handleWebSocketMessage);

  function handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'conversation_updated':
        handleConversationUpdate(data.conversation);
        break;
      case 'new_message':
        handleNewMessage(data.conversation_id, data.message);
        break;
      case 'typing_started':
        handleTypingStatus(data.conversation_id, data.user_id, true);
        break;
      case 'typing_stopped':
        handleTypingStatus(data.conversation_id, data.user_id, false);
        break;
    }
  }

  // Load initial conversations
  useEffect(() => {
    fetchConversations();
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
    };
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchConversations(null, searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchConversations = useCallback(async (cursor?: string | null, query = '') => {
    if (!accessToken) return;

    try {
      const url = new URL(`${API_URL}/messaging/conversations/`);
      const params = new URLSearchParams({
        limit: CONVERSATIONS_PER_PAGE.toString(),
        ...(cursor && { cursor }),
        ...(query && { search: query }),
      });
      url.search = params.toString();

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data: PaginatedConversationsResponse = await response.json();

      setState(prev => ({
        items: cursor ? [...prev.items, ...data.results] : data.results,
        isLoading: false,
        error: null,
        cursor: data.next_cursor,
        hasMore: data.has_more,
      }));

      // Update cache
      data.results.forEach(conversation => {
        conversationsCache.current.set(conversation.id, conversation);
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load conversations',
      }));
    }
  }, [accessToken]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !state.hasMore || state.isLoading) return;

    isLoadingMoreRef.current = true;
    try {
      await fetchConversations(state.cursor, searchQuery);
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [fetchConversations, state.cursor, state.hasMore, state.isLoading, searchQuery]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    await fetchConversations(null, searchQuery);
  }, [fetchConversations, searchQuery]);

  const handleConversationUpdate = useCallback((conversation: Conversation) => {
    conversationsCache.current.set(conversation.id, conversation);
    setState(prev => ({
      ...prev,
      items: prev.items.map(conv => 
        conv.id === conversation.id ? conversation : conv
      ),
    }));
  }, []);

  const handleNewMessage = useCallback((conversationId: string, message: any) => {
    setState(prev => {
      const conversationIndex = prev.items.findIndex(c => c.id === conversationId);
      if (conversationIndex === -1) return prev;

      const updatedItems = [...prev.items];
      const conversation = { ...updatedItems[conversationIndex] };
      conversation.last_message = message;
      conversation.updated_at = message.timestamp;
      
      // Move conversation to top if not already
      if (conversationIndex > 0) {
        updatedItems.splice(conversationIndex, 1);
        updatedItems.unshift(conversation);
      } else {
        updatedItems[0] = conversation;
      }

      return { ...prev, items: updatedItems };
    });
  }, []);

  const handleTypingStatus = useCallback((conversationId: string, userId: string, isTyping: boolean) => {
    setTypingIndicators(prev => {
      const next = new Map(prev);
      const typingUsers = next.get(conversationId) || new Set();

      if (isTyping) {
        typingUsers.add(userId);
      } else {
        typingUsers.delete(userId);
      }

      if (typingUsers.size > 0) {
        next.set(conversationId, typingUsers);
      } else {
        next.delete(conversationId);
      }

      return next;
    });

    // Clear existing timeout if any
    const timeoutKey = `${conversationId}-${userId}`;
    if (typingTimeoutsRef.current.has(timeoutKey)) {
      clearTimeout(typingTimeoutsRef.current.get(timeoutKey));
    }

    // Set new timeout to clear typing status
    if (isTyping) {
      typingTimeoutsRef.current.set(
        timeoutKey,
        setTimeout(() => {
          setTypingIndicators(prev => {
            const next = new Map(prev);
            const typingUsers = next.get(conversationId);
            if (typingUsers) {
              typingUsers.delete(userId);
              if (typingUsers.size === 0) {
                next.delete(conversationId);
              }
            }
            return next;
          });
          typingTimeoutsRef.current.delete(timeoutKey);
        }, 3000)
      );
    }
  }, []);

  return {
    conversations: state.items,
    loading: state.isLoading,
    error: state.error,
    hasMore: state.hasMore,
    searchQuery,
    handleSearch,
    loadMore,
    refresh,
    typingIndicators: Array.from(typingIndicators.entries()).map(([conversationId, users]) => ({
      conversationId,
      users: Array.from(users),
    })),
    connectionStatus,
  };
};

export default useConversations;
