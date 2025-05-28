//contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

interface TokenResponse {
  access: string;
  refresh?: string;
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
  const refreshTokenTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadStoredTokens();
    return () => {
      if (refreshTokenTimeoutRef.current) {
        clearTimeout(refreshTokenTimeoutRef.current);
      }
    };
  }, []);

  const refreshTokens = async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await axios.post<TokenResponse>(`${API_URL}/auth/token/refresh/`, {
        refresh: refreshToken
      });

      if (response.data.access) {
        await updateTokens({ access: response.data.access });
        scheduleTokenRefresh();
        return response.data.access;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await signOut();
    }
    return null;
  };

  const scheduleTokenRefresh = () => {
    if (refreshTokenTimeoutRef.current) {
      clearTimeout(refreshTokenTimeoutRef.current);
    }
    refreshTokenTimeoutRef.current = setTimeout(() => {
      if (authState.refreshToken) {
        refreshTokens(authState.refreshToken);
      }
    }, 55 * 60 * 1000);
  };

  const setupAxiosInterceptor = (token: string) => {
    const axiosInstance = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && authState.refreshToken) {
          originalRequest._retry = true;

          const newToken = await refreshTokens(authState.refreshToken);
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const fetchUserData = async (): Promise<User | null> => {
    if (!authState.accessToken) return null;

    try {
      const response = await axios.get<User>(`${API_URL}/users/me/`, {
        headers: {
          Authorization: `Bearer ${authState.accessToken}`
        }
      });

      const userData = response.data;

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

      if (accessToken && refreshToken) {
        setAuthState({
          accessToken,
          refreshToken,
          isLoading: false,
        });

        if (userData) {
          const parsedUserData = JSON.parse(userData) as User;
          setUser(parsedUserData);
        }

        setupAxiosInterceptor(accessToken);

        // Try to fetch user data to validate token
        let valid = false;
        try {
          const user = await fetchUserData();
          if (user) valid = true;
        } catch (err: any) {
          // If 401, try to refresh token
          if (err && err.response && err.response.status === 401 && refreshToken) {
            const newToken = await refreshTokens(refreshToken);
            if (newToken) {
              setupAxiosInterceptor(newToken);
              const user = await fetchUserData();
              if (user) valid = true;
            }
          }
        }

        if (!valid) {
          // Clear everything and show login
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
          setAuthState({ accessToken: null, refreshToken: null, isLoading: false });
          setUser(null);
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading auth tokens:', error);
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      setUser(null);
    }
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
      scheduleTokenRefresh();

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

          if (!response.data.id || !response.data.email) {
            throw new Error('Invalid user data received');
          }

          userData = {
            ...response.data,
            id: response.data.id,
            email: response.data.email,
            user_type: response.data.user_type || '',
          };

          break;
        } catch (error: any) {
          if (error.response?.status === 429) {
            console.log(`Rate limited (429). Retry attempt ${retryCount + 1} of ${maxRetries}`);
            retryCount++;

            if (retryCount >= maxRetries) {
              console.warn('Max retries reached for fetching user data');
              userData = {
                id: 0,
                email: 'pending@example.com',
                user_type: '',
              };
            }
          } else {
            throw error;
          }
        }
      }

      if (userData) {
        console.log('Setting user data with type:', userData.user_type);
        setUser(userData);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }

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
      if (refreshTokenTimeoutRef.current) {
        clearTimeout(refreshTokenTimeoutRef.current);
      }
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
      scheduleTokenRefresh();
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw error;
    }
  };

  const updateUserRole = async (role: 'patient' | 'therapist') => {
    try {
      if (!authState.accessToken) {
        throw new Error('No access token available');
      }

      // Make the API call to set user type
      const response = await axios.post(
        `${API_URL}/users/set-user-type/`,
        { user_type: role },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authState.accessToken}`
          }
        }
      );

      console.log('User role updated successfully:', response.data);

      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        const updatedUser = {
          ...prev,
          user_type: role
        };
        // Store updated user data
        AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        return updatedUser;
      });

      // Fetch fresh user data to ensure consistency
      await fetchUserData();

    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const mergedData: User = {
        ...user,
        ...updatedUser,
        patient_profile: updatedUser.patient_profile || user?.patient_profile,
        therapist_profile: updatedUser.therapist_profile || user?.therapist_profile,
        user_type: updatedUser.user_type || user?.user_type || ''
      };

      setUser(mergedData);

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