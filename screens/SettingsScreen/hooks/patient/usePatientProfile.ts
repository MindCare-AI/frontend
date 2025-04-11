//screens/SettingsScreen/hooks/patient/usePatientProfile.ts
import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';

// Updated PatientProfile interface to match backend response
export interface PatientProfile {
  id: number;
  unique_id: string;  // Add UUID field
  user: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  medical_history: string | null;
  current_medications: string | null;
  profile_pic: string | null;
  blood_type: string | null;
  treatment_plan: string | null;
  pain_level: number | null;
  last_appointment: string | null;
  next_appointment: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileQueryParams {
  blood_type?: string;
  appointment_after?: string;
  condition?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

export const usePatientProfile = () => {
  const { accessToken, user, updateUser } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (params?: ProfileQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!accessToken || !user) {
        console.log("No access token or user available");
        setLoading(false);
        return null;
      }

      // Use unique_id (UUID) instead of numeric ID
      if (user.patient_profile?.unique_id) {
        const response = await fetch(
          `${API_URL}/patient/profiles/${user.patient_profile.unique_id}/`,
          {
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data: PatientProfile = await response.json();
          setProfile(data);
          setError(null);
          return data;
        }
      }

      // Fallback: Try to list all profiles and match the user if unique_id isn't available
      const listResponse = await fetch(
        `${API_URL}/patient/profiles/`,
        {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!listResponse.ok) {
        throw new Error(`Failed to fetch profiles: ${listResponse.statusText}`);
      }

      const data = await listResponse.json();
      const matchingProfile = data.results.find(
        (p: PatientProfile) =>
          p.user === (typeof user.id === 'string' ? parseInt(user.id, 10) : user.id)
      );
      
      if (matchingProfile && updateUser) {
        await updateUser({
          ...user,
          patient_profile: {
            unique_id: matchingProfile.unique_id
          }
        });
        
        setProfile(matchingProfile);
        setError(null);
        return matchingProfile;
      }

      setError('No profile found for your user account.');
      return null;

    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(error instanceof Error ? error.message : 'Failed to fetch profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: Partial<PatientProfile>) => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken || !user?.patient_profile?.unique_id) {
        setError('Authentication required or patient profile not available');
        setLoading(false);
        return null;
      }

      const formData = new FormData();

      Object.entries(updatedProfile).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'profile_pic' && typeof value === 'string') {
            formData.append(key, value);
          } else if (key === 'emergency_contact' && typeof value === 'object' && value !== null) {
            // Stringify emergency_contact as JSON
            formData.append('emergency_contact', JSON.stringify(value));
          } else {
            formData.append(key, value as any);
          }
        }
      });

      const response = await fetch(
        `${API_URL}/patient/profiles/${user.patient_profile.unique_id}/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            // Do not set Content-Type when sending FormData
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        setError('Authentication failed. Please login again.');
        setLoading(false);
        return null;
      }

      if (!response.ok) {
        setError(`Failed to update profile: ${response.statusText}`);
        setLoading(false);
        return null;
      }

      const data = await response.json();
      setProfile(data);
      return data;
    } catch (error: unknown) {
      console.error('Error saving profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if both token and profile ID exist
    if (accessToken && user?.patient_profile?.unique_id) {
      fetchProfile();
    } else {
      setLoading(false); // Make sure to set loading to false if we're not fetching
    }
  }, [accessToken, user?.patient_profile?.unique_id]);

  return { 
    profile, 
    loading, 
    error,
    saveProfile, 
    refetch: fetchProfile 
  };
};
