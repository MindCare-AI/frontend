import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';

interface NotificationPreference {
  type: string;
  description: string;
  isEnabled: boolean;
}

interface UserPreferencesResponse {
  notification_preferences: NotificationPreference[];
  email_notifications?: boolean;
  in_app_notifications?: boolean;
  disabled_notification_types?: string[];
  // ...other fields from User Preferences Serializer
}

export const useNotificationPreferences = () => {
  const { accessToken, user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [inAppNotifications, setInAppNotifications] = useState<boolean>(true);
  const [disabledTypes, setDisabledTypes] = useState<string[]>([]);
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

      const data: UserPreferencesResponse = await response.json();
      setPreferences(data.notification_preferences || []);
      setEmailNotifications(
        typeof data.email_notifications === 'boolean' ? data.email_notifications : true
      );
      setInAppNotifications(
        typeof data.in_app_notifications === 'boolean' ? data.in_app_notifications : true
      );
      setDisabledTypes(data.disabled_notification_types || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
      console.error('Error fetching notification preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updated: Partial<UserPreferencesResponse>) => {
    try {
      const response = await fetch(`${API_URL}/users/preferences/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        throw new Error(`Failed to save preferences: ${response.status}`);
      }

      const data: UserPreferencesResponse = await response.json();
      setPreferences(data.notification_preferences || []);
      setEmailNotifications(
        typeof data.email_notifications === 'boolean' ? data.email_notifications : true
      );
      setInAppNotifications(
        typeof data.in_app_notifications === 'boolean' ? data.in_app_notifications : true
      );
      setDisabledTypes(data.disabled_notification_types || []);
      return data;
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      throw err;
    }
  };

  // Toggle a single notification type (enabled/disabled)
  const togglePreference = async (type: string, isEnabled: boolean) => {
    const updated = preferences.map(p =>
      p.type === type ? { ...p, isEnabled } : p
    );
    await savePreferences({ notification_preferences: updated });
  };

  // Toggle email notifications
  const toggleEmailNotifications = async (enabled: boolean) => {
    await savePreferences({ email_notifications: enabled });
  };

  // Toggle in-app notifications
  const toggleInAppNotifications = async (enabled: boolean) => {
    await savePreferences({ in_app_notifications: enabled });
  };

  // Toggle disabled notification types (add/remove type)
  const toggleDisabledType = async (type: string, disable: boolean) => {
    let updatedTypes = disabledTypes.slice();
    if (disable) {
      if (!updatedTypes.includes(type)) updatedTypes.push(type);
    } else {
      updatedTypes = updatedTypes.filter(t => t !== type);
    }
    await savePreferences({ disabled_notification_types: updatedTypes });
  };

  useEffect(() => {
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    preferences,
    emailNotifications,
    inAppNotifications,
    disabledTypes,
    loading,
    error,
    togglePreference,
    toggleEmailNotifications,
    toggleInAppNotifications,
    toggleDisabledType,
    savePreferences,
    refetch: fetchPreferences,
  };
};