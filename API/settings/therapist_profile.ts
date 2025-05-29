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
 * Utility function to map backend field names to frontend field names
 * @param backendData The data received from the backend API
 * @returns The same data with frontend-friendly field names
 */
const mapBackendToFrontend = (backendData: any): Partial<TherapistProfile> => {
  const frontendData: Partial<TherapistProfile> = { ...backendData };
  
  // Handle name splitting into first_name and last_name
  if (backendData.name) {
    const nameParts = backendData.name.split(' ');
    if (nameParts.length > 0) frontendData.first_name = nameParts[0];
    if (nameParts.length > 1) frontendData.last_name = nameParts.slice(1).join(' ');
  }
  
  // Map phone to phone_number
  if (backendData.phone) {
    frontendData.phone_number = backendData.phone;
  }
  
  // Map specialization to specializations (array)
  if (backendData.specialization) {
    frontendData.specializations = Array.isArray(backendData.specialization) 
      ? backendData.specialization 
      : [backendData.specialization];
  }
  
  // Map all other fields using the constants
  Object.entries(THERAPIST_PROFILE_CONSTANTS.FIELD_MAPPING.BACKEND_TO_FRONTEND).forEach(
    ([backendField, frontendField]) => {
      if (backendData[backendField] !== undefined && backendField !== 'specialization') {
        frontendData[frontendField] = backendData[backendField];
      }
    }
  );
  
  return frontendData;
};

/**
 * Utility function to map frontend field names to backend field names
 * @param frontendData The data from the frontend
 * @returns The same data with backend-friendly field names
 */
const mapFrontendToBackend = (frontendData: Partial<TherapistProfile>): any => {
  // Create a new object instead of copying all properties to avoid sending fields that shouldn't be modified
  const backendData: any = {};
  
  // Handle name creation from first_name and last_name
  if (frontendData.first_name !== undefined && frontendData.last_name !== undefined) {
    backendData.name = `${frontendData.first_name} ${frontendData.last_name}`;
  }
  
  // Map phone_number to phone
  if (frontendData.phone_number !== undefined) {
    backendData.phone = frontendData.phone_number;
  }
  
  // Map specializations to specialization
  if (frontendData.specializations !== undefined) {
    backendData.specialization = frontendData.specializations;
  }
  
  // Fields that should not be sent to the backend in update operations
  const EXCLUDE_FIELDS = ['user', 'id', 'username', 'email', 'rating', 'total_ratings', 
    'total_sessions', 'profile_completion', 'is_verified', 'verification_status', 'profile_picture',
    'name', 'phone', 'specialization'];
  
  // Map all other fields using the constants, excluding protected fields
  Object.entries(frontendData).forEach(([field, value]) => {
    // Skip excluded fields and fields already handled
    if (
      EXCLUDE_FIELDS.includes(field) || 
      field === 'first_name' || 
      field === 'last_name' || 
      field === 'phone_number' || 
      field === 'specializations' ||
      value === undefined
    ) {
      return;
    }
    
    // Map to backend field name if needed
    const backendField = THERAPIST_PROFILE_CONSTANTS.FIELD_MAPPING.FRONTEND_TO_BACKEND[field] || field;
    
    // Only send non-null values
    if (value !== null) {
      backendData[backendField] = value;
    }
  });
  
  console.log('Mapped data for backend:', backendData);
  return backendData;
};

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
 * Modified to be compatible with the existing backend
 */
interface TherapistProfile {
  id: string | number;
  user: string | number;  // Changed from user_id to user per API response
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;  // Maps to "phone" in the backend
  bio?: string;
  specializations?: string[];  // Maps to "specialization" in the backend
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
  name?: string; // Backend field
  phone?: string; // Backend field
  specialization?: string | string[]; // Backend field
  availability?: any; // Backend field
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
export const getCurrentUserData = async (): Promise<UserData> => {
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
      
      // Map backend fields to frontend fields
      const profile = mapBackendToFrontend(userData.therapist_profile) as TherapistProfile;
      
      // Process the profile picture URL
      profile.profile_picture = getFullImageUrl(profile.profile_picture);
      
      console.log('Mapped therapist profile:', JSON.stringify(profile, null, 2));
      return profile;
    }
    
    // If we get here, the therapist profile wasn't in the user data
    throw new Error('No therapist profile found for current user');
  } catch (error) {
    console.error('Error in getTherapistProfile:', error);
    handleApiError(error);
    throw error;
  }
};

/**
 * Update therapist profile for the current user
 * Maps frontend field names to backend field names when needed
 */
export const updateTherapistProfile = async (profileData: Partial<TherapistProfile>): Promise<TherapistProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userData = await getCurrentUserData();
    
    if (!userData.therapist_profile?.id) {
      throw new Error('No therapist profile ID found for current user');
    }
    
    const profileId = userData.therapist_profile.id;
    
    // Map frontend fields to backend fields
    const mappedData = mapFrontendToBackend(profileData);
    
    console.log('Sending profile update with data:', JSON.stringify(mappedData, null, 2));
    
    const response = await axios.put<TherapistProfile>(
      `${API_URL}/therapist/profiles/${profileId}/`, 
      mappedData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    // Map the response back to frontend fields
    return mapBackendToFrontend(response.data) as TherapistProfile;
  } catch (error) {
    console.error('Error updating therapist profile:', error);
    handleApiError(error);
    throw error;
  }
};

/**
 * Update specific fields of therapist profile for the current user using PATCH
 * This allows for partial updates without affecting other fields
 */
export const updateTherapistProfilePartial = async (profileData: Partial<TherapistProfile>): Promise<TherapistProfile> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userData = await getCurrentUserData();
    
    if (!userData.therapist_profile?.id) {
      throw new Error('No therapist profile ID found for current user');
    }
    
    const profileId = userData.therapist_profile.id;
    
    // Map frontend fields to backend fields
    const mappedData = mapFrontendToBackend(profileData);
    
    console.log('Sending partial profile update with data:', JSON.stringify(mappedData, null, 2));
    
    const response = await axios.patch<TherapistProfile>(
      `${API_URL}/therapist/profiles/${profileId}/`, 
      mappedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Map the response back to frontend fields
    return mapBackendToFrontend(response.data) as TherapistProfile;
  } catch (error) {
    console.error('Error updating therapist profile partially:', error);
    handleApiError(error);
    throw error;
  }
};

/**
 * Upload therapist profile picture for the current user
 */
export const uploadProfilePicture = async (imageData: any) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Get the therapist profile to get the ID
    const profile = await getTherapistProfile();
    if (!profile.id) {
      throw new Error('Therapist profile ID not found');
    }

    console.log('Uploading image with details:', {
      uri: imageData.uri.substring(0, 50) + '...',
      type: imageData.mimeType || 'image/jpeg',
      name: imageData.fileName || 'profile.jpg'
    });

    const formData = new FormData();
    
    // For web, handle base64 data differently
    if (imageData.uri.startsWith('data:')) {
      // Convert base64 to blob for web
      const response = await fetch(imageData.uri);
      const blob = await response.blob();
      formData.append('profile_picture', blob, imageData.fileName || 'profile.jpg');
    } else {
      // For mobile (React Native)
      formData.append('profile_picture', {
        uri: imageData.uri,
        type: imageData.mimeType || 'image/jpeg',
        name: imageData.fileName || 'profile.jpg',
      } as any);
    }

    // Use PUT method instead of PATCH
    const response = await axios.put(
      `${API_URL}/therapist/profiles/${profile.id}/`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout for file uploads
      }
    );

    console.log('Profile picture upload successful:', response.data);
    return response.data;

  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    
    if (error.response?.data?.profile_picture) {
      console.log('Profile picture validation error:', error.response.data.profile_picture);
    }
    
    throw handleApiError(error);
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
  // Constants for therapist specializations
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
  
  // Constants for treatment approaches
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
  
  // Constants for languages
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
  
  // Constants for session duration options
  SESSION_DURATION_OPTIONS: [
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' }
  ],
  
  // Constants for verification statuses
  VERIFICATION_STATUSES: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected'
  },
  
  // Field mapping between backend and frontend
  FIELD_MAPPING: {
    // Frontend to backend
    FRONTEND_TO_BACKEND: {
      'phone_number': 'phone',
      'specializations': 'specialization',
      'profile_picture': 'profile_picture'
    } as Record<string, string>,
    
    // Backend to frontend
    BACKEND_TO_FRONTEND: {
      'phone': 'phone_number',
      'specialization': 'specializations',
      'profile_picture': 'profile_picture'
    } as Record<string, string>
  }
}