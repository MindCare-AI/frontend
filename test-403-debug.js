#!/usr/bin/env node

/**
 * Test script to debug therapist availability 403 error
 * This script helps identify authentication and permission issues
 */

const fs = require('fs');

console.log('🧪 Test Script: Debugging Therapist Availability 403 Error');
console.log('=' .repeat(65));

console.log('\n1. 📱 Steps to Test in the App:');
console.log('   1. Open the app and log in as a therapist user');
console.log('   2. Navigate to Settings > Therapist Availability');
console.log('   3. Watch the browser/metro console for debug logs');
console.log('   4. Look for the following log patterns:');
console.log('');
console.log('      🔐 Starting therapist permission validation...');
console.log('      🔍 Token check: { hasToken: true, tokenLength: 832, ... }');
console.log('      🌐 Making request to /users/me/ with token...');
console.log('      ✅ Received user data from /users/me/: { ... }');
console.log('      📅 Starting getTherapistAvailability...');
console.log('');

console.log('\n2. 🔍 What to Look For in Console Logs:');
console.log('   Check the validateTherapistPermissions logs:');
console.log('   ✓ hasToken should be true');
console.log('   ✓ user_type should be "therapist"');
console.log('   ✓ has_therapist_profile should be true');
console.log('   ✓ therapist_profile_id should be a number/string, not "none"');
console.log('');
console.log('   If any of these fail, note the exact error message.');
console.log('');

console.log('\n3. 🚨 Common Error Scenarios:');
console.log('');
console.log('   Scenario A: User Type Mismatch');
console.log('   - Log: "User type mismatch: expected \'therapist\', got \'patient\'"');
console.log('   - Fix: User needs to be logged in as a therapist');
console.log('');
console.log('   Scenario B: Missing Therapist Profile');
console.log('   - Log: "No therapist_profile object in user data"');
console.log('   - Fix: User needs to complete therapist profile setup');
console.log('');
console.log('   Scenario C: Profile ID Missing');
console.log('   - Log: "Therapist profile exists but has no ID"');
console.log('   - Fix: Backend issue - profile not properly created');
console.log('');
console.log('   Scenario D: Token Issues');
console.log('   - Log: "401 Unauthorized - token expired or invalid"');
console.log('   - Fix: User needs to log in again');
console.log('');
console.log('   Scenario E: Backend Permission Denial');
console.log('   - Log: "403 Forbidden - permission denied by backend"');
console.log('   - Fix: Backend permission middleware issue');
console.log('');

console.log('\n4. 🔧 Manual Testing Commands:');
console.log('   You can test the API directly with curl:');
console.log('');
console.log('   # First, get your access token from browser localStorage or AsyncStorage');
console.log('   # Then test the /users/me/ endpoint:');
console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" \\');
console.log('        -H "Content-Type: application/json" \\');
console.log('        http://localhost:8000/api/v1/users/me/');
console.log('');
console.log('   # Check the response for:');
console.log('   # - user_type: "therapist"');
console.log('   # - therapist_profile: { id: "some_id", ... }');
console.log('');
console.log('   # Then test the availability endpoint:');
console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" \\');
console.log('        -H "Content-Type: application/json" \\');
console.log('        http://localhost:8000/api/v1/therapist/profiles/PROFILE_ID/availability/');
console.log('');

console.log('\n5. 💡 Quick Fixes to Try:');
console.log('');
console.log('   Fix 1: Clear storage and re-login');
console.log('   - Clear browser localStorage / AsyncStorage');
console.log('   - Log in again with therapist credentials');
console.log('');
console.log('   Fix 2: Check user type in database');
console.log('   - Verify user.user_type = "therapist" in backend');
console.log('   - Verify therapist profile exists and has proper ID');
console.log('');
console.log('   Fix 3: Check backend permissions');
console.log('   - Review therapist availability view permissions');
console.log('   - Check if profile ID matching is correct');
console.log('');

console.log('\n6. 📋 Debugging Checklist:');
console.log('   □ Debug logs added to therapist_availability.ts');
console.log('   □ Console shows permission validation steps');
console.log('   □ Token is present and not expired');
console.log('   □ User type is "therapist"');
console.log('   □ Therapist profile exists with valid ID');
console.log('   □ API endpoints are correctly formatted');
console.log('   □ Backend allows access to the specific profile ID');
console.log('');

console.log('\n🚀 Ready to test! Open the app and check the console logs.');
console.log('   Report back with the specific error logs you see.');

// Check if the enhanced logging has been added
const availabilityContent = fs.readFileSync('./API/settings/therapist_availability.ts', 'utf8');
if (availabilityContent.includes('Starting therapist permission validation')) {
  console.log('\n✅ Enhanced logging is active in therapist_availability.ts');
} else {
  console.log('\n❌ Enhanced logging not found - please run the update first');
}
