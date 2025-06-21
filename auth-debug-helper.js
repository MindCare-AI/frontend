#!/usr/bin/env node

/**
 * Authentication flow test helper
 * This script helps verify the user authentication state
 */

console.log('🔐 Authentication Flow Debugger');
console.log('=' .repeat(35));

console.log('\n📋 Quick Authentication Check:');
console.log('   This script will help you verify authentication issues.');
console.log('   Run these commands in your browser console (F12):');
console.log('');

console.log('1. 🔍 Check stored token:');
console.log('   localStorage.getItem("accessToken")');
console.log('   // Should return a JWT token starting with "ey..."');
console.log('');

console.log('2. 🌐 Test /users/me/ endpoint:');
console.log('   fetch("http://localhost:8000/api/v1/users/me/", {');
console.log('     headers: {');
console.log('       "Authorization": "Bearer " + localStorage.getItem("accessToken"),');
console.log('       "Content-Type": "application/json"');
console.log('     }');
console.log('   }).then(r => r.json()).then(console.log)');
console.log('');
console.log('   Expected response:');
console.log('   {');
console.log('     "id": 123,');
console.log('     "email": "therapist@example.com",');
console.log('     "user_type": "therapist",');
console.log('     "therapist_profile": {');
console.log('       "id": 456,');
console.log('       "user": 123,');
console.log('       "first_name": "...",');
console.log('       "last_name": "..."');
console.log('     }');
console.log('   }');
console.log('');

console.log('3. 🔧 Test availability endpoint directly:');
console.log('   // First get your therapist profile ID from step 2');
console.log('   const profileId = "YOUR_PROFILE_ID"; // From therapist_profile.id above');
console.log('   fetch(`http://localhost:8000/api/v1/therapist/profiles/${profileId}/availability/`, {');
console.log('     headers: {');
console.log('       "Authorization": "Bearer " + localStorage.getItem("accessToken"),');
console.log('       "Content-Type": "application/json"');
console.log('     }');
console.log('   }).then(r => r.json()).then(console.log)');
console.log('');

console.log('4. 🚨 Common Issues & Fixes:');
console.log('');
console.log('   Issue: No token found');
console.log('   → Log out and log in again');
console.log('');
console.log('   Issue: user_type is not "therapist"');
console.log('   → Complete therapist onboarding');
console.log('   → Check user type in backend database');
console.log('');
console.log('   Issue: No therapist_profile in response');
console.log('   → Complete therapist profile setup');
console.log('   → Check if profile exists in backend');
console.log('');
console.log('   Issue: 403 on availability endpoint');
console.log('   → Verify profile ID matches the logged-in user');
console.log('   → Check backend permission middleware');
console.log('');

console.log('5. 🧪 React Native Testing (Metro console):');
console.log('   import AsyncStorage from "@react-native-async-storage/async-storage";');
console.log('   AsyncStorage.getItem("accessToken").then(console.log);');
console.log('');

console.log('🎯 Use these tests to identify the exact authentication issue!');
console.log('   Then apply the appropriate fix from the scenarios above.');

console.log('\n📱 Mobile Testing Tip:');
console.log('   In React Native, you can add these checks in a useEffect:');
console.log('');
console.log('   useEffect(() => {');
console.log('     const debugAuth = async () => {');
console.log('       const token = await AsyncStorage.getItem("accessToken");');
console.log('       console.log("Token:", token ? "Present" : "Missing");');
console.log('       ');
console.log('       if (token) {');
console.log('         try {');
console.log('           const response = await fetch("YOUR_API_URL/users/me/", {');
console.log('             headers: { Authorization: `Bearer ${token}` }');
console.log('           });');
console.log('           const userData = await response.json();');
console.log('           console.log("User data:", userData);');
console.log('         } catch (error) {');
console.log('           console.error("Auth test failed:", error);');
console.log('         }');
console.log('       }');
console.log('     };');
console.log('     debugAuth();');
console.log('   }, []);');
console.log('');

console.log('✅ All debugging tools provided! Test and report your findings.');
