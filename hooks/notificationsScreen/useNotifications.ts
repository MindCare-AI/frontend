import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from '../../types/notifications';

// This hook provides all notification features for the authenticated user.
// Endpoints used (see PRD/Backend docs):
// - GET /notifications/ (list notifications, supports ?type=)
// - GET /notifications/<int:pk>/ (retrieve notification)
// - PATCH /notifications/<int:pk>/ (mark as read)
// - GET /notifications/types/ (list notification types)

export const useNotifications = (typeFilter: string | null = null) => {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [types, setTypes] = useState<string[]>([]);

  // Fetch notifications (optionally filtered by type)
  const fetchNotifications = async () => {
    try {
      const url = typeFilter
        ? `${API_URL}/notifications/?type=${encodeURIComponent(typeFilter)}`
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

  // Fetch notification types
  const fetchTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/types/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch notification types: ${response.status}`);
      }
      const data = await response.json();
      setTypes(Array.isArray(data) ? data : data.types || []);
    } catch (err) {
      console.error('Error fetching notification types:', err);
    }
  };

  // Retrieve a single notification by ID
  const getNotification = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch notification: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching notification:', err);
      throw err;
    }
  };

  // Mark a notification as read (PATCH)
  const markAsRead = async (id: number) => {
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
        prev.map(n => String(n.id) === id.toString() ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Refresh notifications
  const refreshNotifications = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
    fetchTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  return {
    notifications,
    loading,
    error,
    refreshing,
    refreshNotifications,
    markAsRead,
    fetchNotifications,
    types,
    getNotification,
  };
};