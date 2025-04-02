//screens/SettingsScreen/hooks/therapist/useTherapistProfile.ts
import { useState, useEffect } from 'react';
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';

export interface TherapistProfile {
  id: number;
  user: number;
  username: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  bio: string;
  profile_pic: string;
  treatment_approaches: string;
  available_days: string;
  license_expiry: string;
  video_session_link: string;
  languages_spoken: string;
  profile_completion_percentage: number;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
  verification_status: 'pending' | string;
}

export const useTherapistProfile = () => {
  const { accessToken, user } = useAuth();
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!accessToken || !user?.therapist_profile?.unique_id) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/therapist/profiles/${user.therapist_profile.unique_id}/`, 
        {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      setProfile(data);
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';
      setError(message);
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: Partial<TherapistProfile>) => {
    try {
      if (!accessToken || !user?.therapist_profile?.unique_id) {
        throw new Error('No access token or therapist profile id available');
      }

      const response = await fetch(
        `${API_URL}/therapist/profiles/${user.therapist_profile.unique_id}/`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(updatedProfile)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      const data = await response.json();
      setProfile(data);
      setError(null);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save profile';
      setError(message);
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const updateAvailability = async (availableDays: Record<string, Array<{start: string; end: string}>>) => {
    if (!accessToken || !user?.therapist_profile?.unique_id) {
      throw new Error('No access token or therapist profile id available');
    }
    try {
      const response = await fetch(
        `${API_URL}/therapist/profiles/${user.therapist_profile.unique_id}/availability/`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ available_days: availableDays })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update availability: ${response.statusText}`);
      }

      const data = await response.json();
      setError(null);
      // Refresh the profile data after a successful update
      await fetchProfile();
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update availability';
      setError(message);
      console.error('Error updating availability:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (accessToken && user) {
      fetchProfile();
    }
  }, [accessToken, user]);

  return { 
    profile, 
    loading, 
    error,
    saveProfile, 
    updateAvailability, 
    refetch: fetchProfile 
  };
};