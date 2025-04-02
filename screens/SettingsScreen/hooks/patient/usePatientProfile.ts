//screens/SettingsScreen/hooks/patient/usePatientProfile.ts
import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';

// Add interface for query parameters
interface ProfileQueryParams {
  blood_type?: string;
  appointment_after?: string;
  condition?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

// Updated PatientProfile interface to match Django serializer fields
export interface PatientProfile {
  id: number;
  user: number; // Added customer user id field
  user_name: string; // assuming this is returned directly
  medical_history?: string;
  current_medications?: string;
  profile_pic: string;
  blood_type?: string;
  treatment_plan?: string;
  pain_level?: number;
  last_appointment?: string;
  next_appointment?: string;
  created_at?: string;
  updated_at?: string;
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
      
      console.log("User type in usePatientProfile:", user?.user_type);
      
      if (!accessToken) {
        console.log("No access token available");
        setLoading(false);
        return null;
      }

      try {
        console.log("Fetching all patient profiles to find one for current user");
        
        // Create query string only with defined parameters
        const queryParams = new URLSearchParams(
          Object.entries(params || {})
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => ({
              ...acc,
              [key]: String(value)
            }), {})
        );

        const listResponse = await fetch(
          `${API_URL}/patient/profiles/${queryParams.toString() ? `?${queryParams}` : ''}`,
          {
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (listResponse.ok) {
          const data = await listResponse.json();
          console.log("Patient profiles response:", data);
          
          if (data.results && data.results.length > 0) {
            const profile = data.results.find((p: PatientProfile) => 
              p.user === (typeof user?.id === 'string' ? parseInt(user.id, 10) : user?.id)
            );
            
            if (profile) {
              console.log("Found matching profile:", profile);
              setProfile(profile);
              
              if (updateUser && user && (!user.patient_profile || user.patient_profile.unique_id !== profile.id.toString())) {
                console.log("Updating user with profile ID:", profile.id);
                await updateUser({
                  ...user,
                  user_type: 'patient',
                  patient_profile: {
                    unique_id: profile.id.toString()
                  }
                });
              }
              
              setLoading(false);
              return profile;
            } else {
              console.log("No profile found matching user ID:", user?.id);
              setError('No profile found for your user account.');
              setLoading(false);
              return null;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile list:", error);
      }
      
      setLoading(false);
      return null;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      setError('Unable to fetch profile data.');
      setLoading(false);
      return null;
    }
  };

  const saveProfile = async (updatedProfile: Partial<PatientProfile>) => {
    try {
      setLoading(true);
      setError(null);

      // Check auth silently without throwing
      if (!accessToken || !user?.patient_profile?.unique_id) {
        setError('Authentication required or patient profile not available');
        setLoading(false);
        return null;
      }

      const formData = new FormData();

      // Append all fields from the updatedProfile to formData
      Object.entries(updatedProfile).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'profile_pic' && typeof value === 'string') {
            // If profile_pic is a URL, append as is
            formData.append(key, value);
          } else if (key === 'emergency_contact' && typeof value === 'object') {
            // Handle nested emergency_contact object
            Object.entries(value).forEach(([ecKey, ecValue]) => {
              if (ecValue !== undefined) {
                formData.append(`emergency_contact.${ecKey}`, ecValue as string);
              }
            });
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
            // Do not specify Content-Type when sending FormData
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
