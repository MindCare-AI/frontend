import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

/**
 * Fetches the user profile
 * @returns Promise with user profile data
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Updates the user profile
 * @param profile User profile data to update
 * @returns Promise with updated user profile
 */
export const updateUserProfile = async (
  profile: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.put(
      `${API_URL}/users/profile`,
      profile,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data as UserProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Changes the user's password
 * @param passwordData Current and new password
 * @returns Promise with success message
 */
export const changePassword = async (
  passwordData: PasswordChange
): Promise<{ message: string }> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.put(
      `${API_URL}/users/password`,
      passwordData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data as { message: string };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};