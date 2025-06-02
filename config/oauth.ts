import { Platform } from 'react-native';
import { API_URL } from '../config';

export const OAUTH_CONFIG = {
  googleAuth: {
    // Required OAuth parameters
    redirectUri: Platform.select({
      web: `${API_URL}/auth/google/callback/`,
      default: 'mindcareai://oauth_callback'
    }),
    scopes: ['openid', 'email', 'profile'],
    responseType: 'code',
    accessType: 'offline',
    prompt: 'consent',
    
    // Required compliance URLs
    privacyPolicyUrl: 'https://mindcareai.com/privacy',
    termsOfServiceUrl: 'https://mindcareai.com/terms',
    applicationHomepage: 'https://mindcareai.com',
    
    // Cross-platform configuration
    crossPlatform: {
      enableCookies: Platform.OS === 'web',
      enableCSRF: true,
      timeout: 30000,
    }
  }
};

// Helper function to get platform-specific OAuth URLs
export const getOAuthUrls = () => {
  const baseUrl = API_URL;
  
  return {
    google: {
      authorize: `${baseUrl}/auth/google/`,
      callback: `${baseUrl}/auth/google/callback/`,
      revoke: `${baseUrl}/auth/google/revoke/`,
    },
    // Add other OAuth providers here as needed
    facebook: {
      authorize: `${baseUrl}/auth/facebook/`,
      callback: `${baseUrl}/auth/facebook/callback/`,
      revoke: `${baseUrl}/auth/facebook/revoke/`,
    },
  };
};

// Helper function to build OAuth state parameter
export const generateOAuthState = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}_${random}`;
};