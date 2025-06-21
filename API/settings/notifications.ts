import axios from 'axios';
import { API_URL } from '../../config';
import { AZIZ_BAHLOUL, MOCK_NOTIFICATIONS } from '../../data/tunisianMockData';

/**
 * Gets the current user type from the API
 * @returns 'patient' or 'therapist' based on the user's profile
 */
interface UserData {
  therapist_profile?: { id: number };
  profile_id?: number;
}

export async function getCurrentUserType() {
  try {
    // MOCK IMPLEMENTATION - Always returns 'patient' for Aziz Bahloul
    console.log("Mock getCurrentUserType called");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return patient since we're using Aziz Bahloul as the main user
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
interface UserPreferencesResponse {
  preferences?: {
    id: number;
  };
}

export async function saveUserPreferences(preferences: any) {
  try {
    // MOCK IMPLEMENTATION - Always succeeds
    console.log("Mock saveUserPreferences called with:", preferences);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("Mock preferences saved successfully");
    return { success: true, message: "Preferences saved successfully" };
  } catch (error) {
    console.error('Error saving user preferences:', error);
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
    // MOCK IMPLEMENTATION - Return default notification preferences
    console.log("Mock getUserPreferences called");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      dark_mode: false,
      language: 'en',
      email_notifications: true,
      in_app_notifications: true,
      disabled_notification_types: [],
      notification_preferences: {
        appointment_reminders: true,
        message_notifications: true,
        system_updates: true,
        marketing_emails: false
      }
    };
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
    // MOCK IMPLEMENTATION - Return predefined notification types
    console.log("Mock getNotificationTypes called");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: 'appointment_reminders',
        name: 'Appointment Reminders',
        description: 'Notifications about upcoming appointments'
      },
      {
        id: 'message_notifications', 
        name: 'Message Notifications',
        description: 'Notifications for new messages'
      },
      {
        id: 'system_updates',
        name: 'System Updates',
        description: 'Important system announcements'
      },
      {
        id: 'marketing_emails',
        name: 'Marketing Emails',
        description: 'Promotional content and updates'
      }
    ];
  } catch (error) {
    console.error('Error fetching notification types:', error);
    // Return an empty array instead of throwing
    return [];
  }
}

