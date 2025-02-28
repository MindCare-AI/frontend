export const OAUTH_CONFIG = {
  googleAuth: {
    // Required OAuth parameters
    redirectUri: 'mindcareai://oauth_callback',
    scopes: ['openid', 'email', 'profile'],
    responseType: 'code',
    accessType: 'offline',
    prompt: 'consent',
    
    // Required compliance URLs
    privacyPolicyUrl: 'https://mindcareai.com/privacy',
    termsOfServiceUrl: 'https://mindcareai.com/terms',
    applicationHomepage: 'https://mindcareai.com'
  }
};