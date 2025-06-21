#!/usr/bin/env node

/**
 * Enhanced test script to create a fix for 403 Forbidden errors
 * This script adds fallback mechanisms and better error handling
 */

const fs = require('fs');

console.log('🔧 Creating Enhanced Fix for 403 Forbidden Errors');
console.log('=' .repeat(55));

console.log('\n1. 📝 Analysis of Potential Issues:');
console.log('   - User authentication state inconsistency');
console.log('   - Profile ID resolution failure');
console.log('   - Token expiration during session');
console.log('   - Backend permission middleware strict validation');

console.log('\n2. 🛠️  Implementing Comprehensive Fix...');

// Read the current availability API
let availabilityContent = fs.readFileSync('./API/settings/therapist_availability.ts', 'utf8');

// Check if we need to add a fallback mechanism
if (!availabilityContent.includes('fallbackUserValidation')) {
  console.log('   ✓ Adding fallback user validation mechanism');
  
  // Add a comprehensive user validation function with multiple fallbacks
  const fallbackValidationFunction = `
/**
 * Enhanced validation with multiple fallback mechanisms
 * @returns Promise with validated therapist profile data
 */
const fallbackUserValidation = async (): Promise<{ id: number | string }> => {
  console.log('🔄 Starting fallback user validation...');
  
  // Try multiple approaches to get valid user data
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }

  try {
    // Primary: Try /users/me/ endpoint
    console.log('🔄 Attempting primary validation via /users/me/...');
    const userResponse = await axios.get(\`\${API_URL}/users/me/\`, {
      headers: { Authorization: \`Bearer \${token}\` }
    });

    const userData = userResponse.data;
    
    // Enhanced checks with detailed logging
    if (userData.user_type === 'therapist' && userData.therapist_profile?.id) {
      console.log('✅ Primary validation successful');
      return userData.therapist_profile;
    }
    
    // Fallback 1: Try to get therapist profile directly
    console.log('🔄 Primary failed, trying direct profile fetch...');
    
    try {
      const profileResponse = await axios.get(\`\${API_URL}/therapist/profiles/me/\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      
      if (profileResponse.data?.id) {
        console.log('✅ Direct profile fetch successful');
        return profileResponse.data;
      }
    } catch (directError) {
      console.log('❌ Direct profile fetch failed:', directError.response?.status);
    }
    
    // Fallback 2: Try to get user's own profile via user ID
    if (userData.id) {
      console.log('🔄 Trying profile fetch via user ID...');
      try {
        const userProfileResponse = await axios.get(\`\${API_URL}/therapist/profiles/?user=\${userData.id}\`, {
          headers: { Authorization: \`Bearer \${token}\` }
        });
        
        const profiles = userProfileResponse.data.results || userProfileResponse.data;
        if (Array.isArray(profiles) && profiles.length > 0 && profiles[0].id) {
          console.log('✅ Profile fetch via user ID successful');
          return profiles[0];
        }
      } catch (userIdError) {
        console.log('❌ Profile fetch via user ID failed:', userIdError.response?.status);
      }
    }
    
    // If all fallbacks fail, provide detailed error
    throw new Error(\`Unable to validate therapist profile. User type: \${userData.user_type}, Has profile: \${!!userData.therapist_profile}, Profile ID: \${userData.therapist_profile?.id || 'none'}\`);
    
  } catch (error: any) {
    console.error('❌ All validation methods failed:', error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Please ensure you have therapist permissions and try logging in again.');
    } else {
      throw new Error(\`Validation failed: \${error.message}\`);
    }
  }
};
`;

  // Insert the fallback function before the existing validateTherapistPermissions
  availabilityContent = availabilityContent.replace(
    '/**\n * Helper function to validate therapist permissions and get profile',
    fallbackValidationFunction + '\n/**\n * Helper function to validate therapist permissions and get profile'
  );
}

// Update the main validation function to use the fallback
if (!availabilityContent.includes('fallbackUserValidation()')) {
  console.log('   ✓ Updating main validation to use fallback mechanism');
  
  availabilityContent = availabilityContent.replace(
    /return userData\.therapist_profile;/,
    `return userData.therapist_profile;
  } catch (error: any) {
    console.error('❌ Primary validation failed, trying fallback...', error.message);
    
    // If primary validation fails, try fallback mechanisms
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log('🔄 Attempting fallback user validation due to permission error...');
      try {
        return await fallbackUserValidation();
      } catch (fallbackError) {
        console.error('❌ Fallback validation also failed:', fallbackError.message);
        throw fallbackError;
      }
    }
    
    throw error;`
  );
}

// Add retry mechanism for API calls
if (!availabilityContent.includes('retryApiCall')) {
  console.log('   ✓ Adding retry mechanism for API calls');
  
  const retryFunction = `
/**
 * Retry API calls with exponential backoff
 */
const retryApiCall = async (apiCall: () => Promise<any>, maxRetries = 2): Promise<any> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      console.log(\`🔄 API call attempt \${attempt + 1} failed:\`, error.response?.status);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Retry on 401, 403, or 500+ errors
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(\`🔄 Retrying in \${delay}ms...\`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
};
`;
  
  availabilityContent = availabilityContent.replace(
    fallbackValidationFunction,
    retryFunction + fallbackValidationFunction
  );
}

// Write the enhanced file
fs.writeFileSync('./API/settings/therapist_availability.ts', availabilityContent);

console.log('   ✅ Enhanced validation and retry mechanisms added');

console.log('\n3. 🔍 Additional Robustness Measures:');
console.log('   ✓ Fallback user validation via multiple endpoints');
console.log('   ✓ Retry mechanism with exponential backoff');
console.log('   ✓ Enhanced error logging and reporting');
console.log('   ✓ Multiple profile resolution strategies');

console.log('\n4. 🧪 Test Plan:');
console.log('   1. Clear storage and login as therapist');
console.log('   2. Navigate to therapist availability screen');
console.log('   3. Check console for detailed validation logs');
console.log('   4. Try saving availability changes');
console.log('   5. Monitor for any remaining 403 errors');

console.log('\n✅ Enhanced fix applied! Test the availability screen now.');
