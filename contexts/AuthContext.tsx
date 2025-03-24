import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  role?: 'patient' | 'therapist' | null;
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

  const loadStoredTokens = async () => {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
      ]);

      if (accessToken) {
        setAuthState({
          accessToken,
          refreshToken,
          isLoading: false,
        });
        setupAxiosInterceptor(accessToken);
      }
    } catch (error) {
      console.error('Error loading auth tokens:', error);
    } finally {
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
    } catch (error) {
      console.error('Error storing auth tokens:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      setAuthState({
        accessToken: null,
        refreshToken: null,
        isLoading: false,
      });
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
      // Update the user state immediately for better UX
      setUser(prev => prev ? { ...prev, role } : null);

      // Then update the backend
      const response = await axios.put('/api/user/role', { role });
      
      if (!response.data) {
        throw new Error('Failed to update role');
      }

      // Save updated user data
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      // Revert the optimistic update on error
      setUser(prev => prev ? { ...prev, role: null } : null);
      throw error;
    }
  };

  const value = {
    ...authState,
    user,
    signIn,
    signOut,
    updateTokens,
    updateUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
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