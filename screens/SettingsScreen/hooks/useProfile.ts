//screens/SettingsScreen/hooks/useProfile.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { usePatientProfile } from './patient/usePatientProfile';
import { useTherapistProfile } from './therapist/useTherapistProfile';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';
import axios from 'axios';

type UserType = 'patient' | 'therapist' | '';

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

interface BaseProfile {
  id: number;
  user: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  profile_pic: string | null;
  created_at: string;
  updated_at: string;
}

interface PatientProfile extends BaseProfile {
  user_name: string;
  medical_history: string | null;
  current_medications: string | null;
  blood_type: string | null;
  treatment_plan: string | null;
  pain_level: number | null;
  last_appointment: string | null;
  next_appointment: string | null;
}

interface TherapistProfile extends BaseProfile {
  username: string;
  specialization: string;
  license_number: string | null;
  years_of_experience: number;
  bio: string | null;
  treatment_approaches: Record<string, any>;
  available_days: Record<string, any>;
  license_expiry: string | null;
  video_session_link: string | null;
  languages_spoken: string[];
  profile_completion_percentage: number;
  is_profile_complete: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
}

interface ProfileResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<ProfileType & { unique_id: string }>;
}

interface ProfileDetailResponse {
  id: number;
  unique_id: string;
  user: number;
  // other profile fields...
}

type ProfileType = PatientProfile | TherapistProfile;

const normalizeId = (id: string | number): number => {
  return typeof id === 'string' ? parseInt(id, 10) : id;
};

// First, let's define the return type interface
interface ProfileHookReturn {
  profile: ProfileType | null;
  loading: boolean;
  error: string | null;
  saveProfile: (data: Partial<ProfileType>) => Promise<ProfileType | null>;
  refetch: () => Promise<void>;
  userType: UserType | undefined;
}

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;
const POLL_INTERVAL = 2000; // Add polling interval constant

export const useProfile = (): ProfileHookReturn => {
  const { user, accessToken } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  
  const patientProfileData = usePatientProfile();
  const therapistProfileData = useTherapistProfile();

  const normalizedUserType = useMemo(
    () => ((user?.user_type || '') as UserType).toLowerCase(),
    [user?.user_type]
  );

  const fetchWithRetry = useCallback(async (retries = 0): Promise<any> => {
    if (!user || !accessToken) throw new Error('User or token missing');
    try {
      const response = await fetch(
        `${API_URL}/${user.user_type}/profiles/?user=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Profile not ready');
      }
      
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        throw new Error('Profile not ready');
      }
      
      return data.results[0];
    } catch (error) {
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(retries + 1);
      }
      throw error;
    }
  }, [user, accessToken]);
  
  const fetchProfile = useCallback(async () => {
    if (!user?.user_type) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profileData = await fetchWithRetry();
      setProfile(profileData);
      setError(null);
      setPollingCount(0); // Reset polling count on success
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Profile setup incomplete - finish onboarding');
      
      // Start polling if profile is not ready
      if (pollingCount < MAX_RETRIES) {
        setTimeout(() => {
          setPollingCount(prev => prev + 1);
          fetchProfile();
        }, POLL_INTERVAL);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.user_type, fetchWithRetry, pollingCount]);

  // Reset states when user changes
  useEffect(() => {
    setPollingCount(0);
    setProfile(null);
    setError(null);
    setLoading(true);
  }, [user?.id]);

  // Initial fetch effect
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id, fetchProfile]);

  if (normalizedUserType === 'patient' || (normalizedUserType === '' && user?.patient_profile)) {
    return {
      ...patientProfileData,
      profile: profile as PatientProfile | null,
      loading,
      error,
      refetch: fetchProfile,
      userType: 'patient' as UserType,
    };
  }
  
  if (normalizedUserType === 'therapist' || (normalizedUserType === '' && user?.therapist_profile)) {
    return {
      ...therapistProfileData,
      profile: profile as TherapistProfile | null,
      loading,
      error,
      refetch: fetchProfile,
      userType: 'therapist' as UserType,
    };
  }
  
  return {
    profile: null,
    loading,
    error: error || 'User type not recognized',
    saveProfile: async () => null,
    refetch: fetchProfile,
    userType: undefined,
  };
};