import { useCallback } from 'react';
import { API_URL } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';

export const useMarkAllRead = () => {
  const { accessToken } = useAuth();

  const markAllRead = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/mark-all-read/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all as read: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }, [accessToken]);

  return { markAllRead };
};