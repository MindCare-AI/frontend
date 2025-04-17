import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';

// This hook fetches the unread notification count for the authenticated user.
// Endpoint: GET /notifications/count/ (see PRD/Backend docs)

export const useNotificationCount = () => {
  const { accessToken } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    try {
      if (!accessToken) throw new Error('No access token available');
      const response = await fetch(`${API_URL}/notifications/count/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch count: ${response.statusText}`);
      }
      const data = await response.json();
      setCount(data.count);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching count');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchCount();
    }
  }, [accessToken]);

  return { count, loading, error, refetch: fetchCount };
};