//utils/auth.tsx/
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();

    if (response.ok) {
      // Update the access token
      await AsyncStorage.setItem('accessToken', data.access);
      return data.access;
    } else {
      // If refresh fails, clear tokens and throw error
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      throw new Error(data.detail || 'Token refresh failed');
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

export const isAuthenticated = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    return !!accessToken;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};