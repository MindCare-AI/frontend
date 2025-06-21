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
  console.log('🔐 Starting therapist permission validation...');
  
  const token = await AsyncStorage.getItem('accessToken');
  console.log('🔍 Token check:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPrefix: token ? token.substring(0, 20) + '...' : 'none'
  });
  
  if (!token) {
    console.error('❌ No authentication token found');
    throw new Error('Authentication token not found. Please log in again.');
  }

  // Get user info to check user type
  try {
    console.log('🌐 Making request to /users/me/ with token...');
    const userResponse = await axios.get<UserData>(`${API_URL}/users/me/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userData = userResponse.data;
    console.log('✅ Received user data from /users/me/:', {
      id: userData.id,
      email: userData.email,
      user_type: userData.user_type,
      has_therapist_profile: !!userData.therapist_profile,
      therapist_profile_id: userData.therapist_profile?.id || 'none',
      full_response_keys: Object.keys(userData)
    });

    // Enhanced validation with detailed logging
    if (!userData.user_type) {
      console.error('❌ User has no user_type field');
      throw new Error('User type not found. Please complete your profile setup.');
    }

    if (userData.user_type !== 'therapist') {
      console.error(`❌ User type mismatch: expected 'therapist', got '${userData.user_type}'`);
      throw new Error(`Access denied. You are logged in as a ${userData.user_type}, but therapist permissions are required to access availability settings.`);
    }

    if (!userData.therapist_profile) {
      console.error('❌ No therapist_profile object in user data');
      throw new Error('No therapist profile found. Please complete your therapist profile setup first.');
    }

    if (!userData.therapist_profile.id) {
      console.error('❌ Therapist profile exists but has no ID:', userData.therapist_profile);
      throw new Error('Therapist profile ID not found. Please contact support.');
    }

    console.log('✅ Permission validation successful:', {
      user_id: userData.id,
      user_type: userData.user_type,
      therapist_profile_id: userData.therapist_profile.id
    });

    return userData.therapist_profile;
  } catch (error: any) {
    console.error('❌ Error in validateTherapistPermissions:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      isAxiosError: error.isAxiosError
    });

    // If primary validation fails with 403 or 401, try fallback mechanisms
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log('🔄 Attempting fallback user validation due to permission error...');
      try {
        return await fallbackUserValidation();
      } catch (fallbackError: any) {
        console.error('❌ Fallback validation also failed:', fallbackError.message);
        throw fallbackError;
      }
    }

    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized - token expired or invalid');
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 403) {
      console.error('❌ 403 Forbidden - permission denied by backend');
      throw new Error('Access denied by server. Please ensure you have therapist permissions.');
    } else if (error.message.includes('Access denied') || error.message.includes('therapist profile')) {
      throw error; // Re-throw our custom error messages
    } else {
      console.error('❌ Unexpected error during permission validation');
      throw new Error('Failed to validate user permissions. Please try logging in again.');
    }
  }
};

/**
 * Retry API calls with exponential backoff
 */
const retryApiCall = async (apiCall: () => Promise<any>, maxRetries = 2): Promise<any> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      console.log(`🔄 API call attempt ${attempt + 1} failed:`, error.response?.status);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Retry on 401, 403, or 500+ errors
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
};

/**
 * Enhanced validation with multiple fallback mechanisms
 * @returns Promise with validated therapist profile data
 */
const fallbackUserValidation = async (): Promise<{ id: number | string }> => {
  console.log('🔄 Starting fallback user validation...');
  
  // Try multiple approaches to get valid user data
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }

  try {
    // Primary: Try /users/me/ endpoint
    console.log('🔄 Attempting primary validation via /users/me/...');
    const userResponse = await axios.get<UserData>(`${API_URL}/users/me/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userData = userResponse.data;
    
    // Enhanced checks with detailed logging
    if (userData.user_type === 'therapist' && userData.therapist_profile?.id) {
      console.log('✅ Primary validation successful');
      return userData.therapist_profile;
    }
    
    // Fallback 1: Try to get therapist profile directly
    console.log('🔄 Primary failed, trying direct profile fetch...');
    
    try {
      const profileResponse = await axios.get<{ id: number | string }>(`${API_URL}/therapist/profiles/me/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (profileResponse.data?.id) {
        console.log('✅ Direct profile fetch successful');
        return profileResponse.data;
      }
    } catch (directError: any) {
      console.log('❌ Direct profile fetch failed:', directError.response?.status);
    }
    
    // Fallback 2: Try to get user's own profile via user ID
    if (userData.id) {
      console.log('🔄 Trying profile fetch via user ID...');
      try {
        const userProfileResponse = await axios.get<{ results?: any[]; [key: string]: any }>(`${API_URL}/therapist/profiles/?user=${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const profiles = userProfileResponse.data.results || userProfileResponse.data;
        if (Array.isArray(profiles) && profiles.length > 0 && profiles[0].id) {
          console.log('✅ Profile fetch via user ID successful');
          return profiles[0];
        }
      } catch (userIdError: any) {
        console.log('❌ Profile fetch via user ID failed:', userIdError.response?.status);
      }
    }
    
    // If all fallbacks fail, provide detailed error
    throw new Error(`Unable to validate therapist profile. User type: ${userData.user_type}, Has profile: ${!!userData.therapist_profile}, Profile ID: ${userData.therapist_profile?.id || 'none'}`);
    
  } catch (error: any) {
    console.error('❌ All validation methods failed:', error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Please ensure you have therapist permissions and try logging in again.');
    } else {
      throw new Error(`Validation failed: ${error.message}`);
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
    console.log('📅 Starting getTherapistAvailability...');
    
    // Validate user permissions first
    const therapistProfile = await validateTherapistPermissions();
    
    const token = await AsyncStorage.getItem('accessToken');
    const profileId = therapistProfile.id;

    console.log(`🔍 Using validated therapist profile ID: ${profileId}`);
    const endpoint = `${API_URL}/therapist/profiles/${profileId}/availability/`;
    console.log(`🔍 GET request to: ${endpoint}`);

    // the backend returns { available_days: { monday: [...], … }, video_session_link: string }
    const response = await retryApiCall(async () => {
      return await axios.get<{
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
    });

    console.log('✅ Retrieved therapist availability successfully:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      availableDaysCount: response.data.available_days ? Object.keys(response.data.available_days).length : 0,
      hasVideoLink: !!response.data.video_session_link
    });

    // flatten available_days into top‐level keys so the screen can do availability[day]
    const { available_days, video_session_link } = response.data;
    const result = {
      ...available_days,
      video_session_link
    };
    
    console.log('✅ Returning flattened availability data:', Object.keys(result));
    return result;
  } catch (error: any) {
    console.error('❌ Error fetching therapist availability:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers
      } : 'no config'
    });
    
    // If we get 403, try fallback validation and retry
    if (error.response?.status === 403) {
      console.log('🔄 403 error detected, trying fallback validation...');
      try {
        const fallbackProfile = await fallbackUserValidation();
        const fallbackToken = await AsyncStorage.getItem('accessToken');
        const fallbackEndpoint = `${API_URL}/therapist/profiles/${fallbackProfile.id}/availability/`;
        
        console.log(`🔄 Retrying with fallback profile ID: ${fallbackProfile.id}`);
        
        const fallbackResponse = await axios.get<{
          available_days: Partial<Record<DayOfWeek, TimeSlot[]>>;
          video_session_link?: string;
        }>(
          fallbackEndpoint,
          { 
            headers: { 
              Authorization: `Bearer ${fallbackToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            } 
          }
        );
        
        console.log('✅ Fallback availability fetch successful');
        const { available_days, video_session_link } = fallbackResponse.data;
        return {
          ...available_days,
          video_session_link
        };
      } catch (fallbackError: any) {
        console.error('❌ Fallback availability fetch also failed:', fallbackError.message);
        // Continue with original error handling
      }
    }
    
    // Enhanced error handling for 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        requestHeaders: error.config?.headers
      });
      throw new Error('Access denied. You may not have permission to access this therapist\'s availability. Please ensure you are logged in as the correct therapist.');
    } else if (error.response?.status === 401) {
      console.error('🚫 401 Unauthorized Error - token may be expired');
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 404) {
      console.error('🚫 404 Not Found - availability endpoint or profile not found');
      throw new Error('Therapist availability not found. You may need to set up your availability first.');
    } else if (error.response) {
      console.error('🚫 HTTP Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      throw new Error(`Server error (${error.response.status}): ${error.response.statusText}`);
    } else if (error.request) {
      console.error('🚫 Network Error - no response received');
      throw new Error('Network error. Please check your internet connection.');
    } else {
      console.error('🚫 Unexpected Error:', error.message);
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
    console.log('📝 Starting updateTherapistAvailability...');
    console.log('📝 Input availability data:', availability);
    
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
    console.log('🔍 Request headers will include:', {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'none'}`
    });

    const response = await retryApiCall(async () => {
      return await axios.patch<TherapistAvailability>(
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
    });

    console.log('✅ Updated therapist availability successfully:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : []
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating therapist availability:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers
      } : 'no config'
    });
    
    // If we get 403, try fallback validation and retry
    if (error.response?.status === 403) {
      console.log('🔄 403 error detected in update, trying fallback validation...');
      try {
        const fallbackProfile = await fallbackUserValidation();
        const fallbackToken = await AsyncStorage.getItem('accessToken');
        const fallbackEndpoint = `${API_URL}/therapist/profiles/${fallbackProfile.id}/availability/`;
        
        console.log(`🔄 Retrying update with fallback profile ID: ${fallbackProfile.id}`);
        
        // Reconstruct payload (same as before)
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

        const payload: any = { available_days };
        if (availability.video_session_link) {
          payload.video_session_link = availability.video_session_link;
        }
        
        const fallbackResponse = await axios.patch<TherapistAvailability>(
          fallbackEndpoint,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              Authorization: `Bearer ${fallbackToken}`
            }
          }
        );
        
        console.log('✅ Fallback availability update successful');
        return fallbackResponse.data;
        
      } catch (fallbackError: any) {
        console.error('❌ Fallback availability update also failed:', fallbackError.message);
        // Continue with original error handling
      }
    }

    // Enhanced error handling for 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        requestHeaders: error.config?.headers,
        requestData: error.config?.data
      });
      throw new Error('Access denied. You may not have permission to update this therapist\'s availability. Please ensure you are logged in as the correct therapist.');
    } else if (error.response?.status === 401) {
      console.error('🚫 401 Unauthorized Error - token may be expired');
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 404) {
      console.error('🚫 404 Not Found - profile or endpoint not found');
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
      console.error('🚫 Network Error - no response received');
      throw new Error('Network error. Please check your internet connection.');
    } else {
      console.error('🚫 Unexpected Error:', error.message);
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
};
