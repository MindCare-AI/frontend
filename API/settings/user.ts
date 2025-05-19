import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiUserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_pic?: string;
  gender?: string;
  date_of_birth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

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
    const response = await axios.get<ApiUserResponse>(`${API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Convert API response to UserProfile format
    return {
      firstName: response.data.first_name || '',
      lastName: response.data.last_name || '',
      email: response.data.email || '',
      phoneNumber: response.data.phone_number || '',
      avatar: response.data.profile_pic || '',
      gender: response.data.gender || '',
      dateOfBirth: response.data.date_of_birth || '',
      address: response.data.address || {}
    };
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
    
    // Convert UserProfile format to API format
    const apiProfile = {
      first_name: profile.firstName,
      last_name: profile.lastName,
      email: profile.email,
      phone_number: profile.phoneNumber,
      profile_pic: profile.avatar,
      gender: profile.gender,
      date_of_birth: profile.dateOfBirth,
      address: profile.address
    };
    
    const response = await axios.put<ApiUserResponse>(
      `${API_URL}/users/me/`,
      apiProfile,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    // Convert response back to UserProfile format
    return {
      firstName: response.data.first_name || '',
      lastName: response.data.last_name || '',
      email: response.data.email || '',
      phoneNumber: response.data.phone_number || '',
      avatar: response.data.profile_pic || '',
      gender: response.data.gender || '',
      dateOfBirth: response.data.date_of_birth || '',
      address: response.data.address || {}
    };
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
      `${API_URL}/users/password/`,
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