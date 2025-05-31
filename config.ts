import { Platform } from 'react-native';

//config.ts
const getLocalApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://127.0.0.1:8000';
    } else if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000';
    } else {
      // iOS simulator or other platforms
      return 'http://127.0.0.1:8000';
    }
  }
  return 'https://api.mindcareai.com';
};

const getLocalWsUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'ws://127.0.0.1:8000';
    } else if (Platform.OS === 'android') {
      return 'ws://10.0.2.2:8000';
    } else {
      // iOS simulator or other platforms
      return 'ws://127.0.0.1:8000';
    }
  }
  return 'wss://api.mindcareai.com';
};

export const API_BASE_URL = getLocalApiUrl();

// Use this for WebSocket connections - Updated to handle authentication
export const WS_BASE_URL = getLocalWsUrl();

// Use this for REST API calls
export const API_URL = `${API_BASE_URL}/api/v1`;

// App Configuration
export const APP_CONFIG = {
  appName: 'Mood Tracker',
  version: '1.0.0',
  theme: {
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f6f6f6',
  }
};

export const SOCIAL_LOGIN_URLS = {
  google: `${API_BASE_URL}/api/v1/auth/login/google/`,
  github: `${API_BASE_URL}/api/v1/auth/login/github/`,
};

export const GOOGLE_CLIENT_ID = '826529019009-12eb7c55fhp7altmd1jnhgel7e92bg39.apps.googleusercontent.com';
export const GITHUB_CLIENT_ID = 'Ov23libU65qS0FNZsNvh';

export const OAUTH_CONFIG = {
  redirectUri: Platform.OS === 'web' 
    ? 'http://localhost:3000/oauth2redirect'  // Web redirect
    : 'com.mindcareai.app://oauth2redirect',  // Mobile redirect
  scopes: ['openid', 'email', 'profile'],
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent',
  githubAuth: {
    scope: 'user:email',
    allowSignup: true
  }
};

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  reconnectAttempts: 5,
  reconnectInterval: 1000,
  heartbeatInterval: 30000,
  connectionTimeout: 10000,
};
