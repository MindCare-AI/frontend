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
  };
  therapist_profile?: {
    id: number;
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
  results: ProfileType[];
}

type ProfileType = PatientProfile | TherapistProfile;

interface ProfileHookReturn {
  profile: ProfileType | null;
  loading: boolean;
  error: string | null;
  saveProfile: (data: Partial<ProfileType>) => Promise<ProfileType | null>;
  refetch: () => Promise<void>;
  userType: UserType | undefined;
}

export const useProfile = (): ProfileHookReturn => {
  const { user, accessToken } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const patientProfileData = usePatientProfile();
  const therapistProfileData = useTherapistProfile();

  const normalizedUserType = useMemo(
    () => ((user?.user_type || '') as UserType).toLowerCase(),
    [user?.user_type]
  );

  // Single fetch attempt without retry logic
  const fetchProfileData = useCallback(async (): Promise<any> => {
    if (!user || !accessToken) throw new Error('User or token missing');
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
      const errorBody = await response.text();
      console.error(`Profile fetch error ${response.status}: ${errorBody}`);
      throw new Error('Profile fetch failed');
    }
    
    const data: ProfileResponse = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('Profile not found');
    }
    
    return data.results[0];
  }, [user, accessToken]);

  const fetchProfile = useCallback(async () => {
    if (!user?.user_type) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profileData = await fetchProfileData();
      setProfile(profileData);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError('Profile setup incomplete - finish onboarding');
    } finally {
      setLoading(false);
    }
  }, [user?.user_type, fetchProfileData]);

  // Reset states when user changes
  useEffect(() => {
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
      saveProfile: async (data: Partial<ProfileType>) => {
        if (!profile) throw new Error('No profile loaded');
        const response = await axios.patch<PatientProfile>(
          `${API_URL}/patient/profiles/${profile.id}/`,
          data as Partial<PatientProfile>,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const updated = response.data;
        setProfile(updated as ProfileType);
        setError(null);
        return updated as ProfileType;
      },
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
      saveProfile: async (data: Partial<ProfileType>): Promise<ProfileType | null> => {
        if (!profile) throw new Error('No profile loaded');
        const response = await axios.patch<TherapistProfile>(
          `${API_URL}/therapist/profiles/${profile.id}/`,
          data as Partial<TherapistProfile>,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const updated = response.data;
        setProfile(updated as ProfileType);
        setError(null);
        return updated as ProfileType;
      },
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