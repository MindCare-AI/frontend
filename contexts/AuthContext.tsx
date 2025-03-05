import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

interface User {
  id: number;
  username: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  authToken: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  authToken: null,
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('user'),
      ]);

      if (storedToken && storedUser) {
        setAuthToken(storedToken);
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error loading auth info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/auth/login/`, {
        username,
        password,
      });

      const { token, user: userData } = response.data;

      await Promise.all([
        AsyncStorage.setItem('authToken', token),
        AsyncStorage.setItem('user', JSON.stringify(userData)),
      ]);

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthToken(token);
      setUser(userData);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('authToken'),
        AsyncStorage.removeItem('user'),
      ]);

      delete axios.defaults.headers.common['Authorization'];
      setAuthToken(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    try {
      await axios.post(`${API_URL}/auth/register/`, {
        username,
        email,
        password,
      });

      // After successful registration, sign in the user
      await signIn(username, password);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        user,
        isLoading,
        signIn,
        signOut,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;