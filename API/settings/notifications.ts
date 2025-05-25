import axios from 'axios';
import { API_URL } from '../../config';

/**
 * Gets the current user type from the API
 * @returns 'patient' or 'therapist' based on the user's profile
 */
export async function getCurrentUserType() {
  try {
    const response = await axios.get(`${API_URL}/users/me/`);
    
    // Check if user has therapist_profile
    if (response.data.therapist_profile && response.data.therapist_profile.id) {
      return 'therapist';
    } 
    // Check if user has patient_profile (using profile_id as indicator)
    else if (response.data.profile_id) {
      return 'patient';
    }
    
    // Default fallback
    return 'patient';
  } catch (error) {
    console.error('Error determining user type:', error);
    // Default to patient on error
    return 'patient';
  }
}

/**
 * Saves user notification preferences to the API
 * @param preferences User preference object
 */
export async function saveUserPreferences(preferences: any) {
  try {
    const response = await axios.put(`${API_URL}/users/preferences/`, {
      dark_mode: preferences.dark_mode,
      language: preferences.language,
      email_notifications: preferences.email_notifications,
      in_app_notifications: preferences.in_app_notifications,
      disabled_notification_types: preferences.disabled_notification_types,
      notification_preferences: preferences.notification_preferences || {}
    });
    
    return response.data;
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
}

/**
 * Gets the current user's preferences from the API
 */
interface UserResponse {
  preferences: any;
}

export async function getUserPreferences() {
  try {
    const response = await axios.get<UserResponse>(`${API_URL}/users/me/`);
    return response.data.preferences;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    throw error;
  }
}

/**
 * Gets available notification types from the API
 */
export async function getNotificationTypes() {
  try {
    const response = await axios.get(`${API_URL}/notifications/types/`);
    
    // Ensure we're returning an array, even if the response has a different structure
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Use type assertion to access properties without TypeScript errors
      const data = response.data as Record<string, unknown>;
      
      // Check if the data is nested within a property like 'results' or 'items'
      if (data.results && Array.isArray(data.results)) {
        return data.results;
      } else if (data.items && Array.isArray(data.items)) {
        return data.items;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else {
        // If we can't find an array, return an empty one
        console.error('Expected array in notification types response, got:', response.data);
        return [];
      }
    }
    return []; // Return an empty array as fallback
  } catch (error) {
    console.error('Error fetching notification types:', error);
    // Return an empty array instead of throwing
    return [];
  }
}

