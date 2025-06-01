import { useState, useEffect, useCallback } from 'react';
import { GroupConversation } from '../../API/groupMessages';
import { getGroupConversations, deleteGroupConversation as apiDeleteConversation } from '../../API/groupMessages';

export function useGroupConversations() {
  const [conversations, setConversations] = useState<GroupConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getGroupConversations();
      setConversations(Array.isArray(response.results) ? response.results : []);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error fetching group conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await getGroupConversations();
      setConversations(Array.isArray(response.results) ? response.results : []);
    } catch (err) {
      console.error('Error refreshing group conversations:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string | number) => {
    try {
      await apiDeleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      return true;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { 
    conversations, 
    loading, 
    error, 
    refreshing,
    fetchConversations,
    refresh,
    deleteConversation
  };
}
