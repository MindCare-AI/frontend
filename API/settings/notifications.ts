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

// Removed unused User interface

interface UserResponse {
  id: string;
  [key: string]: any; // For other properties that might be in the response
}

/**
 * Gets the current user ID
 * @returns Promise with the user ID
 */
const getUserId = async (): Promise<string> => {
  try {
    const response = await axios.get(`${API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${await getToken()}`
      }
    });
    // Type assertion for the response data
    const userData = response.data as UserResponse;
    return userData.id;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw error;
  }
};

/**
 * Fetches the user's notification settings
 * @returns Promise with notification settings
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const userId = await getUserId();
    const response = await axios.get(`${API_URL}/users/preferences/${userId}/`, {
      headers: {
        Authorization: `Bearer ${await getToken()}`
      }
    });
    return response.data as NotificationSettings;
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
    const userId = await getUserId();
    const token = await getToken();
    
    const response = await axios.put(
      `${API_URL}/users/preferences/${userId}/`,
      settings,  // Send settings as the request body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data as NotificationSettings;
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