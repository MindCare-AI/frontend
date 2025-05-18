import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemePreferences {
  mode: 'LIGHT' | 'DARK' | 'SYSTEM';
  color_scheme: string;
}

export interface PrivacySettings {
  profile_visibility: 'PUBLIC' | 'PRIVATE' | 'CONTACTS_ONLY';
  show_online_status: boolean;
}

export interface AppSettings {
  id?: number;
  timezone?: string;
  theme_preferences?: ThemePreferences;
  privacy_settings?: PrivacySettings;
}

// Interface for the user data from /api/v1/users/me/ endpoint
interface UserData {
  id: string;
  // Add other user properties as needed
}

/**
 * Fetches the current user's ID from the API
 * @returns Promise with user ID
 */
const getCurrentUserId = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  const response = await axios.get<UserData>(`${API_URL}/users/me/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.data.id) {
    throw new Error('User ID not found in response');
  }
  
  return response.data.id;
};

/**
 * Fetches the user's application settings
 * @returns Promise with app settings
 */
export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const id = await getCurrentUserId();
    
    const response = await axios.get<AppSettings>(`${API_URL}/users/settings/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Received settings:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching app settings:', error);
    throw error;
  }
};

/**
 * Updates the user's application settings
 * @param settings App settings to update
 * @returns Promise with updated app settings
 */
export const updateAppSettings = async (
  settings: AppSettings
): Promise<AppSettings> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userId = await getCurrentUserId();
    
    console.log('Sending settings update:', settings);
    const response = await axios.put<AppSettings>(
      `${API_URL}/users/settings/${userId}/`,
      settings,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }
};