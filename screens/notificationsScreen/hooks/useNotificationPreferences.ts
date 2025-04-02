import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';

interface NotificationPreference {
  type: string;
  description: string;
  isEnabled: boolean;
}

export const useNotificationPreferences = () => {
  const { accessToken, user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    try {
      if (!user?.id) {
        throw new Error('User ID not available');
      }

      const response = await fetch(`${API_URL}/users/preferences/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.status}`);
      }

      const data = await response.json();
      setPreferences(data.notification_preferences || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
      console.error('Error fetching notification preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updatedPreferences: NotificationPreference[]) => {
    try {
      const response = await fetch(`${API_URL}/users/preferences/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          notification_preferences: updatedPreferences,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save preferences: ${response.status}`);
      }

      const data = await response.json();
      setPreferences(data.notification_preferences);
      return data;
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      throw err;
    }
  };

  const togglePreference = async (type: string, isEnabled: boolean) => {
    const updated = preferences.map(p => 
      p.type === type ? { ...p, isEnabled } : p
    );
    await savePreferences(updated);
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    error,
    togglePreference,
    savePreferences,
    refetch: fetchPreferences,
  };
};