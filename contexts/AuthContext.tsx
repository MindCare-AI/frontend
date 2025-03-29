import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config'; // Ensure this is set correctly

interface User {
  id: string;
  email: string;
  username?: string;
  user_type: 'patient' | 'therapist' | ''; // This is already correct
  // ... other user properties
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
  fetchUserData: () => Promise<void>;
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

  const fetchUserData = async () => {
    if (!authState.accessToken) return;
    
    try {
      // Ensure the endpoint exactly matches your backend (trailing slash if required)
      const response = await axios.get(`${API_URL}/users/me/`, {
        headers: {
          Authorization: `Bearer ${authState.accessToken}`
        }
      });
      
      setUser(response.data as User);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Optionally handle error (for example, force logout if token is invalid)
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
          setUser(JSON.parse(userData));
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
      // Store tokens locally
      await AsyncStorage.multiSet([
        ['accessToken', tokens.access],
        ['refreshToken', tokens.refresh],
      ]);

      // Update state with tokens before making API call
      setAuthState({
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
        isLoading: false,
      });

      // Setup axios interceptor
      setupAxiosInterceptor(tokens.access);

      // Try to fetch user data with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let userData: User | null = null;

      while (retryCount < maxRetries) {
        try {
          // Add delay between retries (increasing with each retry)
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }

          // Fetch user data
          const response = await axios.get(`${API_URL}/users/me/`, {
            headers: {
              Authorization: `Bearer ${tokens.access}`,
            },
          });

          userData = response.data as User;
          break; // Success - exit the retry loop
        } catch (error: any) {
          if (error.response?.status === 429) {
            console.log(`Rate limited (429). Retry attempt ${retryCount + 1} of ${maxRetries}`);
            retryCount++;
            
            if (retryCount >= maxRetries) {
              console.warn('Max retries reached for fetching user data');
              // Continue with sign-in but set partial user state
              userData = { 
                id: '', 
                email: '',
                user_type: ''
              } as User;
            }
          } else {
            // For non-rate limit errors, propagate the error
            throw error;
          }
        }
      }

      // Set user state if we have data
      if (userData) {
        // Ensure the user_type is one of the valid types
        const validUserType = 
          userData.user_type === 'patient' || 
          userData.user_type === 'therapist' || 
          userData.user_type === '';

        if (!validUserType) {
          console.warn(`Received invalid user_type: ${userData.user_type}. Setting to empty string.`);
          userData.user_type = '';
        }
        
        setUser(userData);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }

      // Schedule a retry to fetch complete user data in the background after some delay
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
      // Use type assertion to ensure TypeScript understands this is a valid assignment
      setUser(prev => {
        if (!prev) return null;
        
        // Create a new user object with the updated role
        return {
          ...prev,
          user_type: role as 'patient' | 'therapist' // Explicitly cast to allowed type
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