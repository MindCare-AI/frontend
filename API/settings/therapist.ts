import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface TherapistProfile {
  title?: string;
  bio?: string;
  education?: Education[];
  specialties?: string[];
  languages?: string[];
  experience?: number;
  rates?: {
    hourly?: number;
    currency?: string;
  };
}

/**
 * Fetches the therapist's professional profile
 * @returns Promise with professional profile data
 */
export const getTherapistProfile = async (): Promise<TherapistProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/api/v1/therapists/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching therapist profile:', error);
    throw error;
  }
};

/**
 * Updates the therapist's professional profile
 * @param profile Therapist profile data to update
 * @returns Promise with updated therapist profile
 */
export const updateTherapistProfile = async (
  profile: Partial<TherapistProfile>
): Promise<TherapistProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.put(
      `${API_URL}/api/v1/therapists/profile`,
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
    console.error('Error updating therapist profile:', error);
    throw error;
  }
};