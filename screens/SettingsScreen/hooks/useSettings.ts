//screens/SettingsScreen/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../../config'
import { useAuth } from '../../../contexts/AuthContext';

export interface Settings {
  id: number;
  timezone: string;
  theme_mode: 'SYSTEM' | 'LIGHT' | 'DARK';
  profile_visibility: 'PUBLIC' | 'PRIVATE' | 'CONTACTS';
  theme_preferences: Record<string, string>;
  privacy_settings: Record<string, string>;
  notification_preferences?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const useSettings = () => {
  const { accessToken, user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchSettings = useCallback(async () => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/users/settings/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch settings: ${response.statusText}`);
      }
      const data = await response.json();
      // If the response is paginated and returns an array, use the first result.
      if (data.results && data.results.length > 0) {
        setSettings(data.results[0]);
      } else {
        setSettings(data);
      }
      return settings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error fetching settings:', errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const saveSettings = async (updatedSettings: Partial<Settings>) => {
    try {
      if (!accessToken) throw new Error('No access token available');
      setIsSaving(true);
      
      // Format the settings payload as per backend requirements.
      const formattedData = {
        timezone: updatedSettings.timezone,
        theme_preferences: {
          mode: updatedSettings.theme_preferences?.mode?.toUpperCase(),
          color_scheme: updatedSettings.theme_preferences?.color_scheme
        },
        privacy_settings: {
          profile_visibility: updatedSettings.privacy_settings?.profile_visibility?.toUpperCase(),
          show_online_status: String(updatedSettings.privacy_settings?.show_online_status ?? true)
        },
        notification_preferences: {
          email_notifications: String(updatedSettings.notification_preferences?.email_notifications ?? true),
          in_app_notifications: String(updatedSettings.notification_preferences?.in_app_notifications ?? true)
        }
      };

      const settingsId = settings?.id;
      const url = settingsId 
        ? `${API_URL}/users/settings/${settingsId}/`
        : `${API_URL}/users/settings/`;

      const response = await fetch(url, {
        method: settingsId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || `Failed with status ${response.status}`);
      }

      const data = await response.json();
      setSettings(data);
      return data;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
    }
  }, [user?.id, fetchSettings]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    refetch: fetchSettings,
    isSaving
  };
};