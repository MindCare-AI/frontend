//screens/SettingsScreen/hooks/common/usePreferences.ts
import { useState, useEffect } from 'react';
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';

export interface Preferences {
  dark_mode: boolean;
  language: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  disabled_notification_types: string[];
}

export const usePreferences = () => {
  const { accessToken } = useAuth();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [notificationTypes, setNotificationTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const response = await fetch(`${API_URL}/users/preferences/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to fetch preferences: ${response.statusText}`
        );
      }
      const data = await response.json();
      setPreferences({
        ...data,
        disabled_notification_types: data.disabled_notification_types || [],
      } as Preferences);
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error fetching preferences:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updatedPreferences: Preferences) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const response = await fetch(`${API_URL}/users/preferences/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedPreferences),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to save preferences: ${response.statusText}`
        );
      }

      const data = await response.json();
      setPreferences(data as Preferences);
      setError(null);
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error saving preferences:', errorMessage);
      setError(errorMessage);
      throw error;
    }
  };

  // Fetch notification types from the new endpoint
  const fetchNotificationTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/types/`, {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
              'Accept': 'application/json',
            }
          : {},
      });
      if (!response.ok) {
        console.error(
          `Failed to fetch notification types: ${response.statusText}`
        );
        return;
      }
      const types = await response.json();
      setNotificationTypes(types);
    } catch (error) {
      console.error('Error fetching notification types:', error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchPreferences();
      fetchNotificationTypes();
    }
  }, [accessToken]);

  return {
    preferences,
    loading,
    error,
    savePreferences,
    refetch: fetchPreferences,
    notificationTypes,
  };
};