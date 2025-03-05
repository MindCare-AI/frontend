//config.ts
export const API_BASE_URL = __DEV__ 
  ? 'http://127.0.0.1:8000' 
  : 'https://api.mindcareai.com';

export const API_URL = `${API_BASE_URL}/api/v1`;

export const SOCIAL_LOGIN_URLS = {
  google: `${API_BASE_URL}/api/v1/auth/login/google/`,
  github: `${API_BASE_URL}/api/v1/auth/login/github/`,
};

export const GOOGLE_CLIENT_ID = '826529019009-12eb7c55fhp7altmd1jnhgel7e92bg39.apps.googleusercontent.com';
export const GITHUB_CLIENT_ID = 'Ov23libU65qS0FNZsNvh';

export const OAUTH_CONFIG = {
  redirectUri: 'com.mindcareai.app:/oauth2redirect',  // Updated redirect URI
  scopes: ['openid', 'email', 'profile'],
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent',
  githubAuth: {
    scope: 'user:email',
    allowSignup: true
  }
};