import { useState, useEffect, useCallback } from 'react';
import { DirectConversation } from '../../API/directConversations';
import { getDirectConversations, createDirectConversation, deleteDirectConversation } from '../../API/directConversations';

export function useDirectConversations() {
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDirectConversations();
      setConversations(response.results || []);
    } catch (err) {
      console.error('Error fetching direct conversations:', err);
      setError('Failed to load direct conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await getDirectConversations();
      setConversations(response.results || []);
    } catch (err) {
      console.error('Error refreshing direct conversations:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const createConversation = useCallback(async (participantId: string | number) => {
    try {
      const conv = await createDirectConversation(participantId);
      setConversations(prev => [conv, ...prev]);
      return conv;
    } catch (err) {
      console.error('Error creating direct conversation:', err);
      throw err;
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string | number) => {
    try {
      await deleteDirectConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    } catch (err) {
      console.error('Error deleting direct conversation:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, error, refreshing, fetchConversations, refresh, createConversation, deleteConversation };
}
