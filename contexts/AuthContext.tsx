//contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../config';

// Define interfaces for API responses
interface PatientProfileResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<PatientProfile>;
}

// Define the interface for patient profile creation response
interface NewPatientProfileResponse {
  id: number;
  unique_id: string;  // Add this field
  user: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  medical_history: string | null;
  current_medications: string | null;
  blood_type: string | null;
  created_at: string;
  updated_at: string;
}

interface PatientProfile {
  id: string | number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string;
  address: string;
  phone_number: string;
  emergency_contact: EmergencyContact;
  medical_history: string;
  current_medications: string;
  blood_type: string;
}

interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}

interface User {
  id: string;
  email: string;
  username?: string;
  user_type: 'patient' | 'therapist' | '';
  patient_profile?: {
    unique_id: string;
  };
  therapist_profile?: {
    unique_id: string;
  };
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
  updateUser: (updatedUser: User) => Promise<void>; // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    isLoading: true,
  });

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadStoredTokens();
  }, []);

  const fetchUserData = async (): Promise<User | null> => {
    if (!authState.accessToken) return null;
    
    try {
      console.log("Fetching user data with token:", authState.accessToken.substring(0, 10) + "...");
      
      const response: AxiosResponse<User> = await axios.get(`${API_URL}/users/me/`, {
        headers: {
          Authorization: `Bearer ${authState.accessToken}`
        }
      });
      
      const userData = {
        ...response.data,
        user_type: response.data.user_type || '' // Preserve empty string for onboarding
      };
      
      console.log("User data from API (with type):", userData);
      
      // Only fetch profile if user has a type (don't block onboarding)
      if (userData.user_type === 'patient') {
        try {
          const profileResponse: AxiosResponse<PatientProfileResponse> = await axios.get(
            `${API_URL}/patient/profiles/`,
            {
              headers: {
                Authorization: `Bearer ${authState.accessToken}`
              }
            }
          );
          
          console.log("Patient profiles response:", JSON.stringify(profileResponse.data));
          
          if (profileResponse.data.results?.length > 0) {
            // Use the correct unique_id from the profile
            userData.patient_profile = {
              unique_id: profileResponse.data.results[0].unique_id // Use unique_id instead of id
            };
            console.log("Added patient profile ID:", userData.patient_profile);
          } else {
            // Create new profile only if user has type but no profile
            console.log("Creating new patient profile...");
            try {
              const profileData = {
                first_name: userData.username || '',
                last_name: '',
                // ...other profile fields...
              };
              
              const newProfileResponse = await axios.post<NewPatientProfileResponse>(
                `${API_URL}/patient/profiles/`,
                profileData,
                {
                  headers: {
                    Authorization: `Bearer ${authState.accessToken}`
                }
              });
              
              // Store the correct unique_id from the new profile
              userData.patient_profile = {
                unique_id: newProfileResponse.data.unique_id // Use unique_id from response
              };
            } catch (createError) {
              console.error("Error creating patient profile:", createError);
            }
          }
        } catch (profileError) {
          console.error("Error fetching patient profiles:", profileError);
        }
      }
      
      // Save user data without modifying user_type
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

          const response: AxiosResponse<User> = await axios.get(`${API_URL}/users/me/`, {
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
                id: 'temp-id', // Provide a temporary id
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
        updateUser, // Add updateUser here
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