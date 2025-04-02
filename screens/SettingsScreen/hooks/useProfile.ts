import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { usePatientProfile } from './patient/usePatientProfile';
import { useTherapistProfile } from './therapist/useTherapistProfile';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';

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

export const useProfile = (): ProfileHookReturn => {
  const { user, accessToken, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [fetchCount, setFetchCount] = useState(0); // Add fetch counter

  const userId = user?.id;
  const profileId = user?.patient_profile?.unique_id || user?.therapist_profile?.unique_id;

  const patientProfileData = usePatientProfile();
  const therapistProfileData = useTherapistProfile();

  const normalizedUserType = useMemo(
    () => ((user?.user_type || '') as UserType).toLowerCase(),
    [user?.user_type]
  );

  const userType = useMemo(() => 
    normalizedUserType === 'patient' ? 'patient' : 'therapist', 
    [normalizedUserType]
  );

  const fetchProfile = useCallback(async () => {
    // Prevent duplicate fetches
    if (loading || isInitialized) return;
    
    setLoading(true);
    setError(null);

    try {
      if (!user?.id || !accessToken) {
        throw new Error('No user ID or access token available');
      }

      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      let profilesUrl = '';
      let profileId = '';

      if (normalizedUserType === 'patient' || user?.patient_profile) {
        profilesUrl = `${baseUrl}/patient/profiles`;
        profileId = user?.patient_profile?.unique_id || '';
      } else if (normalizedUserType === 'therapist' || user?.therapist_profile) {
        profilesUrl = `${baseUrl}/therapist/profiles`;
        profileId = user?.therapist_profile?.unique_id || '';
      } else {
        throw new Error('Invalid user type');
      }

      // Only try UUID endpoint if we have a valid UUID
      if (profileId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log("Fetching profile detail from:", `${profilesUrl}/${profileId}/`);
        const detailResponse = await fetch(`${profilesUrl}/${profileId}/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (detailResponse.ok) {
          const profileData = await detailResponse.json();
          setProfile(profileData);
          setIsInitialized(true);
          return;
        }
      }

      // Fallback to list endpoint
      console.log("Fetching profiles list from:", profilesUrl);
      const response = await fetch(profilesUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profiles list: ${response.statusText}`);
      }

      const data: ProfileResponse = await response.json();
      if (data.results.length > 0) {
        setProfile(data.results[0]);
        // Update user with correct UUID if needed and different from current
        if (updateUser && user && data.results[0].unique_id !== profileId) {
          await updateUser({
            ...user,
            [`${normalizedUserType}_profile`]: {
              unique_id: data.results[0].unique_id
            }
          });
        }
      }
      setIsInitialized(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(message);
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken, user?.id, normalizedUserType, updateUser, loading, isInitialized]);

  // Single effect for initialization
  useEffect(() => {
    if (!isInitialized && user?.id && accessToken) {
      fetchProfile();
    }
  }, [fetchProfile, isInitialized, user?.id, accessToken]);

  // Reset state when user changes
  useEffect(() => {
    if (!user?.id) {
      setIsInitialized(false);
      setProfile(null);
      setError(null);
    }
  }, [user?.id]);

  const linkProfile = useCallback(async (user: UserData) => {
    if (user.patient_profile || user.therapist_profile) return;
    
    try {
      const response = await fetch(`${API_URL}/profiles/link/${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to link profile');
      }

      const linkedProfile = await response.json();
      
      if (updateUser) {
        await updateUser({
          ...user,
          id: user.id.toString(), // Convert id to string to match User interface
          [`${user.user_type}_profile`]: {
            unique_id: linkedProfile.id.toString(),
            id: linkedProfile.id.toString(), // Convert id to string
          },
        });
      }
    } catch (err) {
      console.error('Error linking profile:', err);
      throw err;
    }
  }, [accessToken, updateUser]);

  // Update the return statements
  if (normalizedUserType === 'patient' || (normalizedUserType === '' && user?.patient_profile)) {
    const patientData = patientProfileData || {
      profile: null,
      loading: false,
      error: null,
      saveProfile: async () => null
    };

    return {
      ...patientData,
      profile,
      loading,
      error,
      saveProfile: patientData.saveProfile,
      refetch: fetchProfile,
      userType: 'patient' as UserType,
    };
  }

  if (normalizedUserType === 'therapist' || (normalizedUserType === '' && user?.therapist_profile)) {
    const therapistData = therapistProfileData || {
      profile: null,
      loading: false,
      error: null,
      saveProfile: async () => null
    };

    return {
      ...therapistData,
      profile,
      loading,
      error,
      saveProfile: therapistData.saveProfile,
      refetch: fetchProfile,
      userType: 'therapist' as UserType,
    };
  }

  // Default return
  return {
    profile: null,
    loading,
    error: error || 'User type not recognized',
    saveProfile: async () => null,
    refetch: fetchProfile,
    userType: undefined,
  };
};