import axios from 'axios';
import { API_URL } from '../../config';

interface NotificationSettings {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  appointments?: boolean;
  messaging?: boolean;
  marketingUpdates?: boolean;
}

/**
 * Fetches the user's notification settings
 * @returns Promise with notification settings
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/notifications/settings`, {
      headers: {
        Authorization: `Bearer ${await getToken()}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    throw error;
  }
};

/**
 * Updates the user's notification settings
 * @param settings Notification settings to update
 * @returns Promise with updated notification settings
 */
export const updateNotificationSettings = async (
  settings: NotificationSettings
): Promise<NotificationSettings> => {
  try {
    const response = await axios.put(
      `${API_URL}/api/v1/notifications/settings`,
      settings,
      {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

/**
 * Helper function to get the auth token
 */
const getToken = async (): Promise<string | null> => {
  const AsyncStorage = await import('@react-native-async-storage/async-storage');
  return await AsyncStorage.default.getItem('accessToken');
};