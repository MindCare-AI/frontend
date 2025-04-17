//screens/MessagingScreen/hooks/useConversations.ts
import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '../../types/chat';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 20;
  
  const { accessToken } = useAuth();

  const loadConversations = useCallback(async (refresh = false) => {
    if (!accessToken) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const newPage = refresh ? 1 : page;
      
      const queryParams = new URLSearchParams({
        page: newPage.toString(),
      });
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      const oneToOneEndpoint = `${API_URL}/messaging/one_to_one/?${queryParams.toString()}`;
      const groupsEndpoint = `${API_URL}/messaging/groups/?${queryParams.toString()}`;
      
      const [oneToOneResponse, groupsResponse] = await Promise.all([
        fetch(oneToOneEndpoint, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }),
        fetch(groupsEndpoint, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
      ]);
      
      if (!oneToOneResponse.ok && !groupsResponse.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const oneToOneData = oneToOneResponse.ok ? await oneToOneResponse.json() : { results: [] };
      const groupsData = groupsResponse.ok ? await groupsResponse.json() : { results: [] };
      
      const formattedOneToOne = (oneToOneData.results || []).map((conv: any) => ({
        id: conv.id,
        otherParticipant: {
          id: conv.other_participant || '0',
          name: conv.other_user_name || 'Unknown User',
          avatar: undefined,
        },
        participants: conv.participants || [],
        name: conv.other_user_name || 'Chat',
        lastMessage: conv.last_message?.content || 'No messages yet',
        timestamp: conv.created_at || new Date().toISOString(),
        unreadCount: conv.unread_count || 0,
        isGroup: false,
        conversation_type: 'one_to_one',
      }));
      
      const formattedGroups = (groupsData.results || []).map((conv: any) => ({
        id: conv.id,
        otherParticipant: undefined,
        participants: conv.participants || [],
        name: conv.name || 'Group Chat',
        lastMessage: conv.last_message?.content || 'No messages yet',
        timestamp: conv.created_at || new Date().toISOString(),
        unreadCount: conv.unread_count || 0,
        isGroup: true,
        conversation_type: 'group',
      }));
      
      const formattedConversations = [...formattedOneToOne, ...formattedGroups]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setConversations(prev => refresh ? formattedConversations : [...prev, ...formattedConversations]);
      
      const hasMoreOneToOne = !!oneToOneData.next;
      const hasMoreGroups = !!groupsData.next;
      setHasMore(hasMoreOneToOne || hasMoreGroups);
      
      if (hasMoreOneToOne || hasMoreGroups) {
        setPage(newPage + 1);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [page, accessToken, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
    setHasMore(true);
    setConversations([]);
    loadConversations(true);
  }, [loadConversations]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadConversations();
    }
  }, [hasMore, loading, loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    searchQuery,
    handleSearch,
    loadMore,
    refresh: () => loadConversations(true),
    typingIndicators: [] // Default if needed
  };
};

export default useConversations;
