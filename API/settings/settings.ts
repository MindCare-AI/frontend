import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  fontSize?: 'small' | 'medium' | 'large';
  autoPlayMedia?: boolean;
  dataUsage?: {
    wifiOnly?: boolean;
    autoDownload?: boolean;
  };
}

/**
 * Fetches the user's application settings
 * @returns Promise with app settings
 */
export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/api/v1/users/app-settings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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
    const response = await axios.put(
      `${API_URL}/api/v1/users/app-settings`,
      settings,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }
};