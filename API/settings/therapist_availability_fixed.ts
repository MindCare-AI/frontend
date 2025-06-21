import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTherapistProfile } from './therapist_profile';

// User data interface for permission validation
interface UserData {
  id: number;
  email: string;
  user_type: 'patient' | 'therapist' | string;
  therapist_profile?: {
    id: number | string;
    [key: string]: any;
  };
}

/**
 * Helper function to validate therapist permissions and get profile
 * @returns Promise with therapist profile data
 * @throws Error if user doesn't have therapist permissions
 */
const validateTherapistPermissions = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }

  // Get user info to check user type
  try {
    const userResponse = await axios.get<UserData>(`${API_URL}/users/me/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userData = userResponse.data;
    console.log('🔍 Current user data:', {
      id: userData.id,
      email: userData.email,
      user_type: userData.user_type,
      has_therapist_profile: !!userData.therapist_profile
    });

    if (userData.user_type !== 'therapist') {
      throw new Error(`Access denied. You are logged in as a ${userData.user_type || 'unknown user type'}, but therapist permissions are required to access availability settings.`);
    }

    if (!userData.therapist_profile || !userData.therapist_profile.id) {
      throw new Error('No therapist profile found. Please complete your therapist profile setup first.');
    }

    return userData.therapist_profile;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.message.includes('Access denied') || error.message.includes('therapist profile')) {
      throw error; // Re-throw our custom error messages
    } else {
      console.error('Error validating therapist permissions:', error);
      throw new Error('Failed to validate user permissions. Please try logging in again.');
    }
  }
};

// Type representing a single time slot
export interface TimeSlot {
  start: string; // Format: "HH:MM"
  end: string;   // Format: "HH:MM"
}

// Days of the week
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Type representing availability for the entire week
export interface TherapistAvailability {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
  video_session_link?: string;
}

/**
 * Validates a single time slot
 * @param timeSlot The time slot to validate
 * @returns true if valid, throws Error if invalid
 */
export const validateTimeSlot = (timeSlot: TimeSlot): boolean => {
  // Validate time format (HH:MM)
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  
  if (!timeRegex.test(timeSlot.start)) {
    throw new Error(`Invalid start time format: ${timeSlot.start}. Use HH:MM format.`);
  }
  
  if (!timeRegex.test(timeSlot.end)) {
    throw new Error(`Invalid end time format: ${timeSlot.end}. Use HH:MM format.`);
  }
  
  // Parse times for comparison
  const startParts = timeSlot.start.split(':').map(Number);
  const endParts = timeSlot.end.split(':').map(Number);
  
  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];
  
  // Check if end time is after start time
  if (endMinutes <= startMinutes) {
    throw new Error(`End time (${timeSlot.end}) must be after start time (${timeSlot.start})`);
  }
  
  return true;
};

/**
 * Validates all time slots for a specific day
 * @param timeSlots Array of time slots for a day
 * @returns true if valid, throws Error if invalid
 */
export const validateDayTimeSlots = (timeSlots: TimeSlot[]): boolean => {
  if (!timeSlots || timeSlots.length === 0) return true;
  
  // Validate each individual time slot
  timeSlots.forEach(slot => validateTimeSlot(slot));
  
  // Sort slots by start time for overlap checking
  const sortedSlots = [...timeSlots].sort((a, b) => {
    return a.start.localeCompare(b.start);
  });
  
  // Check for overlaps
  for (let i = 0; i < sortedSlots.length - 1; i++) {
    const currentSlot = sortedSlots[i];
    const nextSlot = sortedSlots[i + 1];
    
    if (currentSlot.end > nextSlot.start) {
      throw new Error(`Time slots overlap: ${currentSlot.start}-${currentSlot.end} and ${nextSlot.start}-${nextSlot.end}`);
    }
  }
  
  return true;
};

/**
 * Validates the entire availability schedule
 * @param availability The availability data to validate
 * @returns true if valid, throws Error if invalid
 */
export const validateAvailability = (availability: TherapistAvailability): boolean => {
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    const slots = availability[day];
    if (slots && slots.length > 0) {
      validateDayTimeSlots(slots);
    }
  });
  
  return true;
};

/**
 * Fetches the therapist's availability schedule
 * @returns Promise with availability data
 */
export const getTherapistAvailability = async (): Promise<TherapistAvailability> => {
  try {
    // Validate user permissions first
    const therapistProfile = await validateTherapistPermissions();
    
    const token = await AsyncStorage.getItem('accessToken');
    const profileId = therapistProfile.id;

    console.log(`🔍 Using validated therapist profile ID: ${profileId}`);
    const endpoint = `${API_URL}/therapist/profiles/${profileId}/availability/`;
    console.log(`🔍 GET request to: ${endpoint}`);

    // the backend returns { available_days: { monday: [...], … }, video_session_link: string }
    const response = await axios.get<{
      available_days: Partial<Record<DayOfWeek, TimeSlot[]>>;
      video_session_link?: string;
    }>(
      endpoint,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        } 
      }
    );

    console.log('✅ Retrieved therapist availability successfully:', response.data);

    // flatten available_days into top‐level keys so the screen can do availability[day]
    const { available_days, video_session_link } = response.data;
    return {
      ...available_days,
      video_session_link
    };
  } catch (error: any) {
    console.error('❌ Error fetching therapist availability:', error);
    
    // Enhanced error handling for 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      throw new Error('Access denied. You may not have permission to access this therapist\'s availability. Please ensure you are logged in as the correct therapist.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('Therapist availability not found. You may need to set up your availability first.');
    } else if (error.response) {
      console.error('🚫 HTTP Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      throw new Error(`Server error (${error.response.status}): ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
};

/**
 * Updates the therapist's entire availability schedule
 * @param availability The new availability data
 * @returns Promise with updated availability data
 */
export const updateTherapistAvailability = async (
  availability: TherapistAvailability
): Promise<TherapistAvailability> => {
  try {
    validateAvailability(availability);

    // Validate user permissions first
    const therapistProfile = await validateTherapistPermissions();
    
    const token = await AsyncStorage.getItem('accessToken');
    const profileId = therapistProfile.id;

    // build a single‐level available_days object
    const days: DayOfWeek[] = [
      'monday','tuesday','wednesday','thursday','friday','saturday','sunday'
    ];
    const available_days: Partial<Record<DayOfWeek, TimeSlot[]>> = {};
    days.forEach(day => {
      const slots = availability[day];
      if (slots && slots.length) {
        available_days[day] = slots;
      }
    });

    // assemble payload
    const payload: any = { available_days };
    if (availability.video_session_link) {
      payload.video_session_link = availability.video_session_link;
    }

    console.log(`🔍 Using validated therapist profile ID: ${profileId}`);
    const endpoint = `${API_URL}/therapist/profiles/${profileId}/availability/`;
    console.log(`🔍 PATCH request to: ${endpoint}`);
    console.log('🔍 Request payload:', JSON.stringify(payload, null, 2));

    const response = await axios.patch<TherapistAvailability>(
      endpoint,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Updated therapist availability successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating therapist availability:', error);
    
    // Enhanced error handling for 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      throw new Error('Access denied. You may not have permission to update this therapist\'s availability. Please ensure you are logged in as the correct therapist.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('Therapist profile not found. You may need to create your therapist profile first.');
    } else if (error.response?.status === 400) {
      console.error('🚫 Validation Error Details:', error.response.data);
      throw new Error(`Invalid data: ${JSON.stringify(error.response.data)}`);
    } else if (error.response) {
      console.error('🚫 HTTP Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      throw new Error(`Server error (${error.response.status}): ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
};
