import axios from 'axios'; // Import AxiosError correctly
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AxiosError {
  isAxiosError: boolean;
  response?: {
    status: number;
    data: any;
  };
  message: string;
}

/**
 * Interface defining the user structure
 */
interface User {
  id: string | number;
  email: string;
  [key: string]: any; // For additional properties
}

/**
 * Interface defining the therapist profile structure
 */
interface TherapistProfile {
  id: string | number;
  user: string | number;  // Changed from user_id to user per API response
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  bio?: string;
  specializations?: string[];
  experience?: string;
  years_of_experience?: number;
  license_number?: string;
  license_expiry?: string;
  profile_picture?: string;
  treatment_approaches?: string[];
  languages?: string[];
  rating?: number;
  total_ratings?: number;
  total_sessions?: number;
  profile_completion?: number;
  is_verified?: boolean;
  verification_status?: string;
  hourly_rate?: string | number;
  accepts_insurance?: boolean;
  insurance_providers?: string;
  session_duration?: number;
  [key: string]: any; // For additional properties
}

/**
 * Interface for the user data from /api/v1/users/me/ endpoint
 */
interface UserData {
  id: string;
  email?: string;
  username?: string;
  user_type?: string;
  phone_number?: string;
  date_of_birth?: string;
  preferences?: Record<string, any>;
  settings?: Record<string, any>;
  therapist_profile?: Partial<TherapistProfile>; // Changed from Record<string, any>
  // Add other user properties as needed
}

/**
 * Fetches the current user's data from the API
 * @returns Promise with user data including therapist profile if available
 */
const getCurrentUserData = async (): Promise<UserData> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  try {
    const response = await axios.get<UserData>(`${API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Debug log to see full response
    console.log('Full /users/me/ response:', JSON.stringify(response.data, null, 3));
    
    if (!response.data || !response.data.id) {
      throw new Error('User ID not found in response');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    handleApiError(error);
    throw error;
  }
};

/**
 * Fetches the current therapist's profile
 * @returns Promise with therapist profile data
 */
export const getTherapistProfile = async (): Promise<TherapistProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    // Get full user data which may include the therapist profile
    const userData = await getCurrentUserData();
    
    // Check if therapist_profile is included in the user data
    if (userData.therapist_profile) {
      console.log('Retrieved therapist profile from user data');
      
      // Make sure the therapist profile has the required fields
      if (!userData.therapist_profile.id || !userData.therapist_profile.user) {
        throw new Error('Therapist profile is missing required fields');
      }
      
      // Cast the record to TherapistProfile type since we've verified required fields
      return userData.therapist_profile as TherapistProfile;
    }
    
    // If we get here, the therapist profile wasn't in the user data
    throw new Error('No therapist profile found for current user');
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Update therapist profile for the current user
 */
export const updateTherapistProfile = async (profileData: Partial<TherapistProfile>): Promise<TherapistProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userData = await getCurrentUserData();
    
    if (!userData.therapist_profile?.id) {
      throw new Error('No therapist profile ID found for current user');
    }
    
    const profileId = userData.therapist_profile.id;
    
    const response = await axios.put<TherapistProfile>(
      `${API_URL}/therapist/profiles/${profileId}/`, 
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Upload therapist profile picture for the current user
 */
export const uploadProfilePicture = async (imageFile: File | Blob): Promise<TherapistProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userData = await getCurrentUserData();
    
    if (!userData.therapist_profile?.id) {
      throw new Error('No therapist profile ID found for current user');
    }
    
    const profileId = userData.therapist_profile.id;
    
    const formData = new FormData();
    formData.append('profile_picture', imageFile);
    
    const response = await axios.patch<TherapistProfile>(
      `${API_URL}/therapist/profiles/${profileId}/`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Function to check if the current user has a therapist profile
 * @returns Promise with boolean indicating if profile exists
 */
export const checkTherapistProfileExists = async (): Promise<boolean> => {
  try {
    const userData = await getCurrentUserData();
    
    // If therapist_profile exists and has an id, then the profile exists
    const hasProfile = Boolean(userData?.therapist_profile?.id);
    console.debug(`User ${userData.id} ${hasProfile ? 'has' : 'does not have'} a therapist profile`);
    return hasProfile;
  } catch (error) {
    console.error("Error checking if therapist profile exists:", error);
    return false;
  }
};

/**
 * Error message mappings by HTTP status code
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid input data. Please check your form entries.',
  401: 'Authentication required. Please log in.',
  403: 'You do not have permission to modify this profile.',
  404: 'Therapist profile not found.',
  413: 'File size too large. Please use a smaller image.',
  415: 'Unsupported file format.',
};

/**
 * Handle API errors with appropriate messages
 */
const handleApiError = (error: unknown): void => {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      console.error(
        `API Error (${status}):`, 
        status in ERROR_MESSAGES ? ERROR_MESSAGES[status] : 'An unexpected error occurred'
      );
      
      // You can handle specific field errors here
      if (status === 400 && axiosError.response.data) {
        console.error('Field validation errors:', axiosError.response.data);
      }
    } else {
      console.error('Network Error:', axiosError.message);
    }
  } else {
    console.error('Unknown Error:', error);
  }
};

/**
 * Constants for form field validation and options
 */
export const THERAPIST_PROFILE_CONSTANTS = {
  SPECIALIZATION_CHOICES: [
    'anxiety_disorders',
    'depression',
    'trauma',
    'addiction',
    'eating_disorders',
    'personality_disorders',
    'child_therapy',
    'couples_therapy',
    'family_therapy',
    'grief_counseling',
    'stress_management'
  ],
  
  TREATMENT_APPROACHES: [
    'CBT',
    'DBT',
    'psychodynamic',
    'humanistic',
    'mindfulness',
    'behavioral',
    'solution_focused',
    'narrative',
    'EMDR',
    'integrative'
  ],
  
  LANGUAGES: [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Arabic',
    'Russian',
    'Portuguese',
    'Hindi'
  ],
  
  SESSION_DURATION_OPTIONS: [
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' }
  ],
  
  VERIFICATION_STATUSES: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected'
  }
} as const;