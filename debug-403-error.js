#!/usr/bin/env node

/**
 * Debug script to diagnose 403 Forbidden errors in therapist availability endpoints
 * This script will help identify authentication and permission issues
 */

const fs = require('fs');

console.log('🔍 Debugging 403 Forbidden Error for Therapist Availability');
console.log('=' .repeat(60));

// Check authentication flow
console.log('\n1. 📋 Checking Authentication Flow:');

const authContextContent = fs.readFileSync('./contexts/AuthContext.tsx', 'utf8');
const therapistAvailabilityContent = fs.readFileSync('./API/settings/therapist_availability.ts', 'utf8');
const therapistProfileContent = fs.readFileSync('./API/settings/therapist_profile.ts', 'utf8');

// Check for token storage and retrieval
console.log('   ✓ Token storage methods:');
if (authContextContent.includes('AsyncStorage.setItem') && authContextContent.includes('accessToken')) {
  console.log('     - AsyncStorage token storage: ✓');
} else {
  console.log('     - AsyncStorage token storage: ❌');
}

if (therapistAvailabilityContent.includes('AsyncStorage.getItem(\'accessToken\')')) {
  console.log('     - Token retrieval in availability API: ✓');
} else {
  console.log('     - Token retrieval in availability API: ❌');
}

// Check user type validation
console.log('\n   ✓ User type validation:');
if (therapistAvailabilityContent.includes('user_type !== \'therapist\'')) {
  console.log('     - User type check in availability API: ✓');
} else {
  console.log('     - User type check in availability API: ❌');
}

// Check profile ID resolution
console.log('\n   ✓ Profile ID resolution:');
if (therapistAvailabilityContent.includes('validateTherapistPermissions')) {
  console.log('     - Permission validation function: ✓');
} else {
  console.log('     - Permission validation function: ❌');
}

if (therapistAvailabilityContent.includes('therapistProfile.id')) {
  console.log('     - Profile ID extraction: ✓');
} else {
  console.log('     - Profile ID extraction: ❌');
}

// Check endpoint construction
console.log('\n   ✓ Endpoint construction:');
const endpointPattern = /therapist\/profiles\/\$\{profileId\}\/availability\//;
if (endpointPattern.test(therapistAvailabilityContent)) {
  console.log('     - Availability endpoint pattern: ✓');
} else {
  console.log('     - Availability endpoint pattern: ❌');
}

console.log('\n2. 🔐 Checking Permission Validation Logic:');

// Extract the validateTherapistPermissions function logic
const validateFunctionMatch = therapistAvailabilityContent.match(/const validateTherapistPermissions = async \(\) => \{([\s\S]*?)\};/);
if (validateFunctionMatch) {
  console.log('   ✓ Found validateTherapistPermissions function');
  
  const functionBody = validateFunctionMatch[1];
  
  // Check specific validation steps
  if (functionBody.includes('/users/me/')) {
    console.log('     - Fetches user data from /users/me/: ✓');
  } else {
    console.log('     - Fetches user data from /users/me/: ❌');
  }
  
  if (functionBody.includes('user_type') && functionBody.includes('therapist')) {
    console.log('     - Validates user_type is therapist: ✓');
  } else {
    console.log('     - Validates user_type is therapist: ❌');
  }
  
  if (functionBody.includes('therapist_profile') && functionBody.includes('id')) {
    console.log('     - Validates therapist_profile.id exists: ✓');
  } else {
    console.log('     - Validates therapist_profile.id exists: ❌');
  }
} else {
  console.log('   ❌ validateTherapistPermissions function not found');
}

console.log('\n3. 🚨 Common 403 Error Causes:');

console.log('   Potential issues:');
console.log('   1. User logged in as patient trying to access therapist endpoints');
console.log('   2. Token expired or invalid');
console.log('   3. User has no therapist_profile in /users/me/ response');
console.log('   4. Therapist profile ID mismatch between frontend and backend');
console.log('   5. Backend permission validation rejecting the request');

console.log('\n4. 🔧 Debugging Steps to Try:');

console.log('   1. Check current user data:');
console.log('      - Log the full /users/me/ response');
console.log('      - Verify user_type is "therapist"');
console.log('      - Verify therapist_profile.id exists');
console.log('');
console.log('   2. Check token validity:');
console.log('      - Verify accessToken is not expired');
console.log('      - Test with a fresh login');
console.log('');
console.log('   3. Check backend logs:');
console.log('      - Look for 403 errors in backend logs');
console.log('      - Check permission middleware');
console.log('');
console.log('   4. Test with API client:');
console.log('      - Use curl/Postman to test endpoints directly');
console.log('      - Compare frontend headers with working requests');

console.log('\n5. 🔍 Error Patterns Found:');

// Look for error handling patterns
if (therapistAvailabilityContent.includes('403')) {
  console.log('   ✓ 403 error handling found in availability API');
  
  // Extract 403 error messages
  const errorMessages = therapistAvailabilityContent.match(/403[\s\S]*?throw new Error\('([^']+)'\)/g);
  if (errorMessages) {
    console.log('   Error messages:');
    errorMessages.forEach((msg, index) => {
      const messageMatch = msg.match(/throw new Error\('([^']+)'\)/);
      if (messageMatch) {
        console.log(`     ${index + 1}. "${messageMatch[1]}"`);
      }
    });
  }
} else {
  console.log('   ❌ No specific 403 error handling found');
}

console.log('\n6. 💡 Recommended Fix Strategy:');

console.log('   Step 1: Add comprehensive logging');
console.log('   Step 2: Verify user authentication state');
console.log('   Step 3: Check therapist profile resolution');
console.log('   Step 4: Ensure correct profile ID is used');
console.log('   Step 5: Add fallback error handling');

console.log('\n🚀 Next: Run this script to add debug logging to the availability API');
