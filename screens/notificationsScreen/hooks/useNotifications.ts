import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';
import { Notification } from '../../../types/notifications';

export const useNotifications = (typeFilter: string | null = null) => {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const url = typeFilter 
        ? `${API_URL}/notifications/?type=${typeFilter}`
        : `${API_URL}/notifications/`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();
      // If the API returns notifications under a key "results", use that:
      setNotifications(Array.isArray(data) ? data : data.results || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshNotifications = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }

      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [typeFilter]);

  return {
    notifications,
    loading,
    error,
    refreshing,
    refreshNotifications,
    markAsRead,
    fetchNotifications,
  };
};