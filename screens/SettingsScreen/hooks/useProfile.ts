// file: screens/SettingsScreen/hooks/useProfile.ts
import { usePatientProfile } from './patient/usePatientProfile';
import { useTherapistProfile } from './therapist/useTherapistProfile';
import { useAuth } from '../../../contexts/AuthContext';
import { Alert } from 'react-native';

// Define the user type literals for type safety
type UserType = 'patient' | 'therapist' | '';

// Define API response types
interface UserSettings {
  id: number;
  timezone: string;
  theme_mode: 'SYSTEM' | string;
  profile_visibility: 'PUBLIC' | string;
  theme_preferences: Record<string, string>;
  privacy_settings: Record<string, string>;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  dark_mode: boolean;
  language: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  disabled_notification_types: string[];
  notification_preferences: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  user_type: UserType;
  phone_number: string;
  date_of_birth: string;
  preferences: UserPreferences;
  settings: UserSettings;
  patient_profile?: {
    id: number;
    unique_id: string;
  };
  therapist_profile?: {
    id: number;
    unique_id: string;
  };
}

export const useProfile = () => {
  const { user } = useAuth();
  const patientProfile = usePatientProfile();
  const therapistProfile = useTherapistProfile();
  
  // Add debug logging
  console.log("useProfile debug:", {
    hasUser: !!user,
    userType: user?.user_type,
    hasPatientProfile: !!user?.patient_profile,
    patientProfileId: user?.patient_profile?.unique_id,
  });

  // Normalize user type according to API spec
  const normalizedUserType = ((user?.user_type || '') as UserType).toLowerCase();
  
  // If user type is patient or empty (but has patient profile)
  if (normalizedUserType === 'patient' || (normalizedUserType === '' && user?.patient_profile)) {
    return {
      ...patientProfile,
      userType: 'patient' as UserType,
    };
  }

  // If user type is therapist
  if (normalizedUserType === 'therapist' || (normalizedUserType === '' && user?.therapist_profile)) {
    return {
      ...therapistProfile,
      userType: 'therapist' as UserType,
    };
  }

  // Log detailed info for debugging
  console.warn(`Unrecognized user type: "${user?.user_type}"`, {
    user: JSON.stringify(user, null, 2)
  });

  // Return default state with proper types
  return {
    profile: null,
    loading: false,
    error: `User type not recognized. Please contact support.`,
    saveProfile: async () => {},
    refetch: async () => {},
    userType: undefined as UserType | undefined,
  };
};