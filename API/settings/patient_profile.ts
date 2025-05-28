import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PatientProfile {
  id?: number;
  user?: number;
  user_name?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  profile_pic?: string | null;
  blood_type?: string;
  gender?: 'M' | 'F' | 'O' | 'N';
  date_of_birth?: string;  // Consider if this belongs elsewhere
  emergency_contact?: {
    length: number;
    name?: string;
    phone?: string;
    relation?: string;
    email?: string;
  };
  created_at?: string;
  updated_at?: string;
}

// Interface for the user data from /api/v1/users/me/ endpoint
interface UserData {
  profile_id: string;
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
  
  if (!response.data.profile_id) {
    throw new Error('User ID not found in response');
  }
  
  return response.data.profile_id;
};

/**
 * Fetches the current patient's profile
 * @returns Promise with patient profile data
 */
export const getPatientProfile = async (): Promise<PatientProfile> => {
  try {
    console.log('Starting to fetch patient profile...');
    const token = await AsyncStorage.getItem('accessToken');
    const userId = await getCurrentUserId();
    
    console.log(`Fetching profile for user ID: ${userId}`);
    
    const response = await axios.get<PatientProfile>(
      `${API_URL}/patient/profiles/${userId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('Profile data received successfully');
    console.log('Full profile response:', JSON.stringify(response.data, null, 2));
    console.log('Date of birth from API:', response.data.date_of_birth);
    
    // Check if date_of_birth exists and log its format
    if (response.data.date_of_birth) {
      console.log('Date of birth exists in response');
      console.log('Date format:', response.data.date_of_birth);
      console.log('Date type:', typeof response.data.date_of_birth);
    } else {
      console.log('Date of birth is missing in the profile data');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    
    // Log more detailed error information
    
    throw error;
  }
};

/**
 * Updates the patient's profile
 * @param profile The profile data to update
 * @returns Promise with updated profile data
 */
export const updatePatientProfile = async (
  profile: Partial<PatientProfile>
): Promise<PatientProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userId = await getCurrentUserId();
    
    const response = await axios.put<PatientProfile>(
      `${API_URL}/patient/profiles/${userId}/`,
      profile,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating patient profile:', error);
    throw error;
  }
};

/**
 * Partially updates the patient's profile using PATCH (for profile picture and/or other fields)
 * Uses multipart/form-data for file upload.
 * @param data FormData containing profile_pic and/or other fields
 * @returns Promise with updated profile data
 */
export const patchPatientProfile_pic = async (
  data: FormData
): Promise<PatientProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userId = await getCurrentUserId();

    const response = await axios.patch<PatientProfile>(
      `${API_URL}/patient/profiles/${userId}/`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error patching patient profile (pic):', error);
    throw error;
  }
};

/**
 * Helper function to construct full image URLs
 */
const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, construct the full URL
  if (imagePath.startsWith('/media/')) {
    return `${API_URL}${imagePath}`;
  }
  
  // If it doesn't start with /media/, add it
  if (!imagePath.startsWith('/')) {
    return `${API_URL}/media/${imagePath}`;
  }
  
  return `${API_URL}${imagePath}`;
};

/**
 * Uploads a patient profile picture and returns the updated profile
 * Uses multipart/form-data for file upload.
 * @param imageData Image data to upload
 * @returns Promise with updated profile data
 */
export const uploadPatientProfilePicture = async (
  imageData: any
): Promise<PatientProfile> => {
  try {
    console.log('Uploading patient profile picture...');
    const token = await AsyncStorage.getItem('accessToken');
    const userId = await getCurrentUserId();

    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log('Patient ID:', userId);
    console.log('Image details:', {
      uri: imageData.uri.substring(0, 50) + '...',
      type: imageData.mimeType || 'image/jpeg',
      name: imageData.fileName || 'profile.jpg'
    });

    const formData = new FormData();
    
    // Handle different image formats (web vs mobile)
    if (imageData.uri.startsWith('data:')) {
      // Convert base64 to blob for web
      const response = await fetch(imageData.uri);
      const blob = await response.blob();
      formData.append('profile_pic', blob, imageData.fileName || 'profile.jpg');
    } else {
      // For mobile (React Native)
      formData.append('profile_pic', {
        uri: imageData.uri,
        type: imageData.mimeType || 'image/jpeg',
        name: imageData.fileName || 'profile.jpg',
      } as any);
    }

    const response = await axios.patch<PatientProfile>(
      `${API_URL}/patient/profiles/${userId}/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout for file uploads
      }
    );

    console.log('Profile picture upload successful');
    
    // Process the profile_pic URL to ensure it's a full path
    if (response.data && response.data.profile_pic) {
      response.data.profile_pic = getFullImageUrl(response.data.profile_pic);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error uploading patient profile picture:', error);
    
    if (error.response?.data?.profile_pic) {
      console.error('Profile picture validation error:', error.response.data.profile_pic);
    }
    
    throw error;
  }
};