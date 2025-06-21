#!/usr/bin/env node

// Test therapist availability API endpoints and permissions
console.log('🔍 Testing Therapist Availability API - 403 Error Investigation');
console.log('='*70);

const path = require('path');
const fs = require('fs');

// Check the API configuration first
console.log('\n📡 Checking API Configuration:');
try {
  const configPath = './config.ts';
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const apiUrlMatch = configContent.match(/API_URL\s*=\s*['"](.*?)['"]/);
    if (apiUrlMatch) {
      console.log('✅ API_URL found:', apiUrlMatch[1]);
    }
  }
} catch (error) {
  console.log('❌ Could not read config.ts:', error.message);
}

// Check authentication setup
console.log('\n🔐 Checking Authentication Setup:');
try {
  const availabilityContent = fs.readFileSync('./API/settings/therapist_availability.ts', 'utf8');
  
  const hasAsyncStorage = availabilityContent.includes('AsyncStorage.getItem(\'accessToken\')');
  const hasAuthHeaders = availabilityContent.includes('Authorization: `Bearer ${token}`');
  const hasErrorHandling = availabilityContent.includes('catch (error)');
  
  console.log('✅ Uses AsyncStorage for token:', hasAsyncStorage);
  console.log('✅ Sets Authorization header:', hasAuthHeaders);
  console.log('✅ Has error handling:', hasErrorHandling);
  
  // Check for specific 403 handling
  const has403Handling = availabilityContent.includes('403') || availabilityContent.includes('Forbidden');
  console.log('⚠️  Specific 403 handling:', has403Handling);
  
} catch (error) {
  console.log('❌ Could not analyze availability API:', error.message);
}

// Check therapist profile dependency
console.log('\n👨‍⚕️ Checking Therapist Profile Dependencies:');
try {
  const availabilityContent = fs.readFileSync('./API/settings/therapist_availability.ts', 'utf8');
  const profileContent = fs.readFileSync('./API/settings/therapist_profile.ts', 'utf8');
  
  const usesGetTherapistProfile = availabilityContent.includes('getTherapistProfile()');
  const hasProfileIdCheck = availabilityContent.includes('profile.id');
  
  console.log('✅ Uses getTherapistProfile():', usesGetTherapistProfile);
  console.log('✅ Checks profile.id:', hasProfileIdCheck);
  
  // Check if profile API has 403 handling
  const profile403Handling = profileContent.includes('403');
  console.log('✅ Profile API has 403 handling:', profile403Handling);
  
} catch (error) {
  console.log('❌ Could not check profile dependencies:', error.message);
}

// Check endpoint URL structure
console.log('\n🎯 Checking Endpoint Structure:');
try {
  const availabilityContent = fs.readFileSync('./API/settings/therapist_availability.ts', 'utf8');
  
  // Extract the endpoint patterns
  const getEndpointMatch = availabilityContent.match(/`\${API_URL}\/therapist\/profiles\/\${.*?}\/availability\/`/);
  const patchEndpointMatch = availabilityContent.match(/`\${API_URL}\/therapist\/profiles\/\${.*?}\/availability\/`/g);
  
  if (getEndpointMatch) {
    console.log('✅ GET endpoint pattern:', getEndpointMatch[0]);
  }
  if (patchEndpointMatch && patchEndpointMatch.length >= 2) {
    console.log('✅ PATCH endpoint pattern:', patchEndpointMatch[1]);
  }
  
  // Check for hardcoded profile IDs
  const hasHardcodedId = availabilityContent.includes('profiles/1/') || availabilityContent.includes('profiles/123/');
  console.log('⚠️  Has hardcoded profile IDs:', hasHardcodedId);
  
} catch (error) {
  console.log('❌ Could not check endpoint structure:', error.message);
}

// Check for user permission logic
console.log('\n🔒 Checking User Permission Logic:');
try {
  const authContent = fs.readFileSync('./contexts/AuthContext.tsx', 'utf8');
  
  const hasUserType = authContent.includes('user_type') || authContent.includes('userType');
  const hasIsTherapist = authContent.includes('isTherapist') || authContent.includes('is_therapist');
  const hasRoleCheck = authContent.includes('role') || authContent.includes('Role');
  
  console.log('✅ Has user_type logic:', hasUserType);
  console.log('✅ Has isTherapist logic:', hasIsTherapist);
  console.log('✅ Has role checking:', hasRoleCheck);
  
} catch (error) {
  console.log('❌ Could not check auth context:', error.message);
}

// Suggestions for debugging
console.log('\n🛠️  403 Error Debugging Suggestions:');
console.log('1. Verify the user is logged in as a therapist (not patient)');
console.log('2. Check if the therapist profile ID exists and belongs to the current user');
console.log('3. Ensure the backend allows the authenticated user to access their own availability');
console.log('4. Verify the token is valid and not expired');
console.log('5. Check if the backend expects additional permissions or role verification');

console.log('\n🔍 Next Steps:');
console.log('1. Add detailed error logging to see the exact 403 response');
console.log('2. Verify the profile ID being used in the request');
console.log('3. Check backend permissions for therapist availability endpoints');
console.log('4. Test with a known valid therapist account');

console.log('\n🚀 Test completed! Check the output above for potential issues.');
