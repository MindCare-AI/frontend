//contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { PatientProfile, TherapistProfile } from '../types/profile';

interface PatientProfileResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: number;
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
  }>;
}

interface TherapistProfileResponse {
  id: number;
  user: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  specialization: string;
  license_number: string | null;
  years_of_experience: number;
  bio: string | null;
  profile_pic: string | null;
  treatment_approaches: string[];
  available_days: {
    [key: string]: any[];
  };
  license_expiry: string | null;
  video_session_link: string | null;
  languages_spoken: string[];
  profile_completion_percentage: number;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
  verification_status: 'pending' | 'in_progress' | 'verified' | 'rejected';
}

export interface User {
  id: number;
  email: string;
  username?: string;
  user_type: 'patient' | 'therapist' | '';
  patient_profile?: PatientProfile;
  therapist_profile?: TherapistProfile;
  phone_number?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  user: User | null;
  signIn: (tokens: { access: string; refresh: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateTokens: (tokens: { access: string; refresh?: string }) => Promise<void>;
  updateUserRole: (role: 'patient' | 'therapist') => Promise<void>;
  fetchUserData: () => Promise<User | null>;
  updateUser: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    isLoading: true,
  });

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PatientProfile | TherapistProfile | null>(null);

  useEffect(() => {
    loadStoredTokens();
  }, []);

  const fetchUserData = async (): Promise<User | null> => {
    if (!authState.accessToken) return null;
    
    try {
      const response = await axios.get<User>(`${API_URL}/users/me/`, {
        headers: {
          Authorization: `Bearer ${authState.accessToken}`
        }
      });
      
      const userData = response.data;
      
      // Fetch profile data if user type exists
      if (userData.user_type) {
        try {
          const profileResponse = await axios.get<PatientProfile | TherapistProfile>(
            `${API_URL}/${userData.user_type}/profiles/?user=${userData.id}`,
            {
              headers: {
                Authorization: `Bearer ${authState.accessToken}`
              }
            }
          );
          
          if (profileResponse.data) {
            setProfile(profileResponse.data);
            if (userData.user_type === 'patient') {
              userData.patient_profile = profileResponse.data as PatientProfile;
            } else if (userData.user_type === 'therapist') {
              userData.therapist_profile = profileResponse.data as TherapistProfile;
            }
          }
        } catch (profileError) {
          console.error("Profile fetch error:", profileError);
        }
      }
      
      setUser(userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const loadStoredTokens = async () => {
    try {
      const [accessToken, refreshToken, userData] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
        AsyncStorage.getItem('userData'),
      ]);

      if (accessToken) {
        setAuthState({
          accessToken,
          refreshToken,
          isLoading: false,
        });
        
        if (userData) {
          const parsedUserData = JSON.parse(userData) as User;
          console.log("Loading stored user data:", parsedUserData); // Add this debug log
          setUser(parsedUserData);
        }
        
        setupAxiosInterceptor(accessToken);
        // Fetch fresh user data in the background
        fetchUserData();
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth tokens:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const setupAxiosInterceptor = (token: string) => {
    axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  };

  const signIn = async (tokens: { access: string; refresh: string }) => {
    try {
      await AsyncStorage.multiSet([
        ['accessToken', tokens.access],
        ['refreshToken', tokens.refresh],
      ]);

      setAuthState({
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
        isLoading: false,
      });

      setupAxiosInterceptor(tokens.access);

      let retryCount = 0;
      const maxRetries = 3;
      let userData: User | null = null;

      while (retryCount < maxRetries) {
        try {
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }

          const response = await axios.get<User>(`${API_URL}/users/me/`, {
            headers: {
              Authorization: `Bearer ${tokens.access}`,
            },
          });

          // Ensure required fields exist
          if (!response.data.id || !response.data.email) {
            throw new Error('Invalid user data received');
          }

          userData = {
            ...response.data,
            // Ensure required fields have values
            id: response.data.id,
            email: response.data.email,
            user_type: response.data.user_type || '', // Default to empty string for onboarding
          };
          
          break;
        } catch (error: any) {
          if (error.response?.status === 429) {
            console.log(`Rate limited (429). Retry attempt ${retryCount + 1} of ${maxRetries}`);
            retryCount++;
            
            if (retryCount >= maxRetries) {
              console.warn('Max retries reached for fetching user data');
              // Ensure we create a valid User object
              userData = {
                id: 0, // Provide a temporary id
                email: 'pending@example.com', // Provide a temporary email
                user_type: '', // Empty string triggers onboarding
              };
            }
          } else {
            throw error;
          }
        }
      }

      // Now we can safely check userData since it will always be a valid User object
      if (userData) {
        console.log('Setting user data with type:', userData.user_type);
        setUser(userData);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }

      // Only schedule background fetch if we hit max retries
      if (retryCount >= maxRetries) {
        setTimeout(() => fetchUserData(), 5000);
      }
    } catch (error: any) {
      console.error('Error during sign in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
      setAuthState({
        accessToken: null,
        refreshToken: null,
        isLoading: false,
      });
      setUser(null);
    } catch (error) {
      console.error('Error removing auth tokens:', error);
      throw error;
    }
  };

  const updateTokens = async (tokens: { access: string; refresh?: string }) => {
    try {
      const updates: [string, string][] = [['accessToken', tokens.access]];
      if (tokens.refresh) {
        updates.push(['refreshToken', tokens.refresh]);
      }

      await AsyncStorage.multiSet(updates);
      setAuthState(prev => ({
        ...prev,
        accessToken: tokens.access,
        refreshToken: tokens.refresh ?? prev.refreshToken,
      }));

      setupAxiosInterceptor(tokens.access);
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw error;
    }
  };

  const updateUserRole = async (role: 'patient' | 'therapist') => {
    try {
      // Update the user state immediately for a better UX
      setUser(prev => {
        if (!prev) return null;
        
        // Create a new user object with the updated role
        return {
          ...prev,
          user_type: role
        };
      });

      // Then update the backend
      await axios.post(
        `${API_URL}/users/set-user-type/`,
        { user_type: role },
        {
          headers: {
            Authorization: `Bearer ${authState.accessToken}`
          }
        }
      );
      
      // After successful update, refresh user data to ensure it's in sync
      await fetchUserData();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      // Create merged data preserving profile information with type assertion
      const mergedData: User = {
        ...user,  // Start with existing user data
        ...updatedUser, // Apply updates
        // Preserve profile data, preferring new data if provided
        patient_profile: updatedUser.patient_profile || user?.patient_profile,
        therapist_profile: updatedUser.therapist_profile || user?.therapist_profile,
        // Ensure user_type is preserved and valid
        user_type: updatedUser.user_type || user?.user_type || '' // Default to empty string if undefined
      };

      // Update state
      setUser(mergedData);
      
      // Persist to storage
      await AsyncStorage.setItem('userData', JSON.stringify(mergedData));
      
      console.log('Updated user data:', {
        before: user,
        after: mergedData
      });
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: authState.accessToken,
        refreshToken: authState.refreshToken,
        isLoading: authState.isLoading,
        user,
        signIn,
        signOut,
        updateTokens,
        updateUserRole,
        fetchUserData,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};