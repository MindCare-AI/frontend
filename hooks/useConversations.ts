import { useState, useEffect, useCallback } from 'react';
import { getConversations } from '../API/conversations';

interface Conversation {
  id: string | number;
  is_group: boolean;
  name?: string;
  participants: any[];
  other_user_name?: string;
  other_participant?: {
    id: number;
    username?: string;
    full_name?: string;
  };
  last_message?: {
    content: string;
    timestamp: string;
    sender_name?: string;
  };
  unread_count?: number;
  created_at: string;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshConversations: () => Promise<void>;
}

export const useConversations = (): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('[useConversations] 📋 Loading conversations...');
      
      const response = await getConversations();
      const conversationList = response.results || [];
      
      console.log(`[useConversations] ✅ Loaded ${conversationList.length} conversations`);
      setConversations(conversationList);
      
    } catch (err) {
      console.error('[useConversations] ❌ Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshConversations = useCallback(async () => {
    console.log('[useConversations] 🔄 Refreshing conversations...');
    await loadConversations(true);
  }, [loadConversations]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    refreshing,
    error,
    refreshConversations,
  };
};
