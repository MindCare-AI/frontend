import { useCallback } from 'react';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

// This hook provides the feature to mark all notifications as read for the authenticated user.
// Endpoint: POST /notifications/mark-all-read/ (see PRD/Backend docs)

export const useMarkAllRead = () => {
  const { accessToken } = useAuth();

  const markAllRead = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/mark-all-read/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all as read: ${response.status}`);
      }

      // Optionally, you may want to return the updated notification count or status
      // const data = await response.json();
      // return data;

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }, [accessToken]);

  return { markAllRead };
};