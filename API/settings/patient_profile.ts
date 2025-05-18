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
  profile_pic?: string;
  blood_type?: string;
  gender?: 'M' | 'F' | 'O' | 'N';
  date_of_birth?: string;
  emergency_contact?: string;
  created_at?: string;
  updated_at?: string;
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
 * Fetches the current patient's profile
 * @returns Promise with patient profile data
 */
export const getPatientProfile = async (): Promise<PatientProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userId = await getCurrentUserId();
    
    const response = await axios.get<PatientProfile>(
      `${API_URL}/patient/profiles/${userId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching patient profile:', error);
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