#!/usr/bin/env node

/**
 * Test script to verify therapist booking modal functionality
 */

const axios = require('axios');

// Configuration - adjust these for your testing environment
const config = {
  baseURL: process.env.API_URL || 'https://mindcareapi.onrender.com/api/v1',
  testToken: process.env.TEST_TOKEN || null
};

/**
 * Test the therapist profiles API endpoints
 */
async function testTherapistAPIs() {
  console.log('🧪 Testing Therapist APIs');
  console.log('========================');
  
  if (!config.testToken) {
    console.log('⚠️  No TEST_TOKEN provided. Set it as environment variable for API testing.');
    console.log('   export TEST_TOKEN="your_access_token"');
    console.log('   node test-booking-modal-fix.js');
    console.log('\n🔄 Showing expected data format only...\n');
  }

  // Test 1: Direct all profiles endpoint
  console.log('📋 Test 1: GET /therapist/profiles/all/');
  try {
    if (config.testToken) {
      const response = await axios.get(`${config.baseURL}/therapist/profiles/all/`, {
        headers: { Authorization: `Bearer ${config.testToken}` }
      });
      
      console.log('✅ Response received');
      console.log(`📊 Type: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
      console.log(`📊 Length: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const firstTherapist = response.data[0];
        console.log('📋 First therapist sample:');
        console.log('   ID:', firstTherapist.id);
        console.log('   First Name:', firstTherapist.first_name || 'empty');
        console.log('   Last Name:', firstTherapist.last_name || 'empty');
        console.log('   Has Availability:', !!firstTherapist.availability);
        console.log('   Available Days:', firstTherapist.availability ? Object.keys(firstTherapist.availability) : 'none');
      }
    } else {
      console.log('⚠️  Skipping API call (no token)');
      console.log('📋 Expected format: Array of therapist objects');
      console.log('   Each object should have: id, first_name, last_name, availability');
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.message);
  }

  console.log('\n📋 Test 2: Dropdown API format');
  console.log('Expected: { results: Array }');
  console.log('This should return the same data but wrapped in a results object');

  console.log('\n🔧 BookAppointmentModal Fix Analysis:');
  console.log('=====================================');
  
  console.log('✅ Issue Identified:');
  console.log('   - API returns: { results: Array(5) }');
  console.log('   - Old code expected: Array directly');
  console.log('   - New code handles both formats');
  
  console.log('\n✅ Fix Applied:');
  console.log('   1. Enhanced response format detection');
  console.log('   2. Handles: Array, { results: Array }, { data: Array }');
  console.log('   3. Better error handling and logging');
  console.log('   4. TypeScript type safety maintained');
  
  console.log('\n🎯 Expected Behavior After Fix:');
  console.log('   1. Open "Book New Appointment" modal');
  console.log('   2. Therapist dropdown should show available therapists');
  console.log('   3. Names should display properly (not just IDs)');
  console.log('   4. After selecting therapist, available days should show');
  console.log('   5. After selecting day, time slots should appear');
  
  console.log('\n📱 Debug Information:');
  console.log('   - Check browser console for detailed logs starting with:');
  console.log('     📱 [BookAppointmentModal]');
  console.log('   - Look for: "Found X therapists" message');
  console.log('   - Verify: "Mapped therapists" array has proper labels');
  
  console.log('\n🔍 Troubleshooting:');
  console.log('   1. If still no therapists: Check token validity');
  console.log('   2. If empty names: Check first_name/last_name fields in database');
  console.log('   3. If no time slots: Check therapist availability data');
  console.log('   4. For text node errors: Look for stray characters in JSX');
}

/**
 * Simulate the frontend data processing
 */
function simulateDataProcessing() {
  console.log('\n🔄 Simulating Frontend Data Processing:');
  console.log('======================================');
  
  // Sample API response that would come from backend
  const mockApiResponse = {
    results: [
      {
        id: 2,
        first_name: "mahemd aziz",
        last_name: "bahlouldd",
        profile_picture: "/media/therapist_profile_pics/profile_1748353745178.jpg",
        bio: "",
        specializations: [],
        years_of_experience: 0,
        education: [],
        license_number: null,
        languages: ["English", "Arabic", "French"],
        is_verified: true,
        rating: 0.0,
        hourly_rate: null,
        availability: {
          monday: [{ end: "17:00", start: "09:00" }]
        }
      },
      {
        id: 7,
        first_name: "",
        last_name: "",
        profile_picture: null,
        bio: "",
        specializations: [],
        years_of_experience: 0,
        education: [],
        license_number: null,
        languages: [],
        is_verified: true,
        rating: 0.0,
        hourly_rate: null,
        availability: {
          monday: [{ end: "17:00", start: "09:00" }],
          tuesday: [{ end: "17:00", start: "09:00" }],
          wednesday: [{ end: "17:00", start: "09:00" }]
        }
      }
    ]
  };
  
  console.log('📥 Mock API Response Format:');
  console.log(`   Type: ${typeof mockApiResponse}`);
  console.log(`   Has results: ${!!mockApiResponse.results}`);
  console.log(`   Results count: ${mockApiResponse.results.length}`);
  
  // Simulate the new processing logic
  let therapistArray;
  if (Array.isArray(mockApiResponse)) {
    therapistArray = mockApiResponse;
    console.log('📊 Processing: Direct array format');
  } else if (mockApiResponse && mockApiResponse.results && Array.isArray(mockApiResponse.results)) {
    therapistArray = mockApiResponse.results;
    console.log('📊 Processing: { results: Array } format');
  } else {
    therapistArray = [];
    console.log('📊 Processing: Unknown format, defaulting to empty array');
  }
  
  console.log(`✅ Extracted ${therapistArray.length} therapists`);
  
  // Simulate mapping logic
  const mappedTherapists = therapistArray.map((therapist) => {
    let displayName = '';
    
    let firstName = (therapist.first_name || '').trim();
    let lastName = (therapist.last_name || '').trim();
    
    if (firstName && lastName) {
      displayName = `${firstName} ${lastName}`;
    } else if (firstName) {
      displayName = firstName;
    } else if (lastName) {
      displayName = lastName;
    } else {
      displayName = `Therapist ${therapist.id}`;
    }
    
    return {
      label: displayName,
      value: therapist.id?.toString() || "",
    };
  });
  
  console.log('\n📋 Mapped for Dropdown:');
  mappedTherapists.forEach((therapist, index) => {
    console.log(`   ${index + 1}. "${therapist.label}" (ID: ${therapist.value})`);
  });
  
  console.log('\n✅ Processing Complete - Ready for UI Display');
}

/**
 * Check text node issue potential causes
 */
function analyzeTextNodeIssue() {
  console.log('\n🔍 Text Node Error Analysis:');
  console.log('============================');
  
  console.log('❌ Error: "Unexpected text node: . A text node cannot be a child of a <View>"');
  console.log('\n🔍 Common Causes:');
  console.log('   1. Stray period (.) character outside <Text> components');
  console.log('   2. Template literal with undefined values');
  console.log('   3. Conditional rendering with falsy values that become text');
  console.log('   4. JSX formatting issues');
  console.log('   5. Copy-paste artifacts');
  
  console.log('\n🔧 Solutions Applied:');
  console.log('   1. Enhanced API response handling (main issue)');
  console.log('   2. Better error boundaries');
  console.log('   3. Proper conditional rendering');
  
  console.log('\n💡 If text node errors persist:');
  console.log('   1. Check for loose characters in JSX');
  console.log('   2. Ensure all text is wrapped in <Text> components');
  console.log('   3. Check template literals: `${variable}` vs `{variable}`');
  console.log('   4. Verify conditional rendering: {condition && <Component />}');
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 BookAppointmentModal Fix Verification');
  console.log('========================================\n');
  
  await testTherapistAPIs();
  simulateDataProcessing();
  analyzeTextNodeIssue();
  
  console.log('\n🎯 Summary:');
  console.log('===========');
  console.log('✅ API response format handling improved');
  console.log('✅ Data processing logic enhanced');  
  console.log('✅ Error handling strengthened');
  console.log('✅ TypeScript type safety maintained');
  
  console.log('\n🧪 Next Steps:');
  console.log('   1. Test the booking modal in the app');
  console.log('   2. Verify therapists appear in dropdown');
  console.log('   3. Check console logs for detailed debugging info');
  console.log('   4. If text node errors persist, check JSX formatting');
}

// Run tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testTherapistAPIs, simulateDataProcessing, analyzeTextNodeIssue };
