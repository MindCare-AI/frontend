//screens/MessagingScreen/hooks/useConversations.ts
import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '../../../types/chat';
import { API_BASE_URL } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';

const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 20;
  
  // Use the real access token from auth context
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
        page: newPage.toString()
        // Don't use query param unless specified in API docs
        // The API docs show only 'page' is supported
      });

      // Fetch both one-to-one and group conversations in parallel
      const [oneToOneResponse, groupsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/messaging/one_to_one/?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }),
        fetch(`${API_BASE_URL}/api/v1/messaging/groups/?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
      ]);
      
      // Handle possible errors from either endpoint
      if (!oneToOneResponse.ok && !groupsResponse.ok) {
        throw new Error('Failed to fetch conversations');
      }

      // Parse responses - handle case where one endpoint fails but the other succeeds
      const oneToOneData = oneToOneResponse.ok ? await oneToOneResponse.json() : { results: [] };
      const groupsData = groupsResponse.ok ? await groupsResponse.json() : { results: [] };
      
      // Format one-to-one conversations according to API response structure
      const formattedOneToOne = (oneToOneData.results || []).map((conv: any) => ({
        id: conv.id,
        otherParticipant: {
          id: conv.other_participant || '0',
          name: conv.other_user_name || 'Unknown User',
          avatar: undefined  // Not provided in the API
        },
        participants: conv.participants || [],
        name: conv.other_user_name || 'Chat',
        lastMessage: conv.last_message?.content || 'No messages yet', // Extract content
        timestamp: conv.created_at || new Date().toISOString(),
        unreadCount: conv.unread_count || 0,
        isGroup: false,
        conversation_type: 'one_to_one',
      }));
      
      // Format group conversations according to API response structure
      const formattedGroups = (groupsData.results || []).map((conv: any) => ({
        id: conv.id,
        otherParticipant: undefined,
        participants: conv.participants || [],
        name: conv.name || 'Group Chat',
        lastMessage: conv.last_message?.content || 'No messages yet', // Extract content
        timestamp: conv.created_at || new Date().toISOString(),
        unreadCount: conv.unread_count || 0,
        isGroup: true,
        conversation_type: 'group',
      }));
      
      // Combine and sort all conversations
      const formattedConversations = [...formattedOneToOne, ...formattedGroups]
        .sort((a, b) => {
          // Sort by timestamp (newest first)
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
      
      // Update the state with new data
      setConversations(prev => refresh ? formattedConversations : [...prev, ...formattedConversations]);
      
      // Check if there are more pages in either endpoint using the next field
      const hasMoreOneToOne = !!oneToOneData.next;
      const hasMoreGroups = !!groupsData.next;
      setHasMore(hasMoreOneToOne || hasMoreGroups);
      
      // Extract next page number from URL or increment
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
  }, [page, searchQuery, accessToken]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
    setHasMore(true);
    setConversations([]);
    loadConversations(true);
  }, [loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    searchQuery,
    handleSearch,
    loadMore: () => hasMore && !loading && loadConversations(),
    refresh: () => loadConversations(true),
  };
};

export default useConversations;
