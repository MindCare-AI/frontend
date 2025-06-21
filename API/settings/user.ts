import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AZIZ_BAHLOUL, SLIMEN_ABYADH, getPatientById, getTherapistById } from '../../data/tunisianMockData';

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
    // MOCK IMPLEMENTATION - Return Aziz Bahloul's data
    console.log("Mock getUserProfile called");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = AZIZ_BAHLOUL;
    
    // Convert mock data to UserProfile format
    return {
      firstName: mockUser.first_name,
      lastName: mockUser.last_name,
      email: mockUser.email,
      phoneNumber: mockUser.phone_number,
      avatar: mockUser.profile_pic,
      gender: mockUser.gender === 'M' ? 'male' : 'female',
      dateOfBirth: mockUser.date_of_birth,
      address: mockUser.address
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
    // MOCK IMPLEMENTATION - Always succeeds and returns the updated data
    console.log("Mock updateUserProfile called with:", profile);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return the current profile merged with updates
    const currentProfile = await getUserProfile();
    const updatedProfile = { ...currentProfile, ...profile };
    
    console.log("Mock profile updated successfully:", updatedProfile);
    return updatedProfile;
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
    // MOCK IMPLEMENTATION - Always succeeds
    console.log("Mock changePassword called");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return { message: "Password changed successfully" };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};