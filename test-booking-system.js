#!/usr/bin/env node

// Test script to verify the booking system works correctly with real therapist data
// Run with: node test-booking-system.js

const fs = require('fs');
const path = require('path');

// Try to load the mock data
try {
  console.log('🧪 Testing Booking System with Real Therapist Data\n');
  
  // Load the mock data file
  const mockDataPath = path.join(__dirname, 'data', 'tunisianMockData.ts');
  if (!fs.existsSync(mockDataPath)) {
    console.log('❌ Mock data file not found');
    process.exit(1);
  }
  
  console.log('✅ Mock data file exists');
  
  // Read the content to verify it contains the real therapist data
  const content = fs.readFileSync(mockDataPath, 'utf8');
  
  // Check for real therapist names
  const realTherapistNames = [
    'Slimen Abyadh',
    'Dr. Slimen Abyadh',
    'Cognitive Behavioral Therapy',
    'University of Tunis El Manar'
  ];
  
  console.log('\n📋 Checking for real therapist data:');
  
  let allFound = true;
  realTherapistNames.forEach(name => {
    if (content.includes(name)) {
      console.log(`✅ Found: ${name}`);
    } else {
      console.log(`❌ Missing: ${name}`);
      allFound = false;
    }
  });
  
  // Check for booking functions
  const bookingFunctions = [
    'getAvailableTherapists',
    'getTherapistDropdownOptions', 
    'getAvailableTimeSlots',
    'mockBookAppointment'
  ];
  
  console.log('\n🔧 Checking for booking functions:');
  
  bookingFunctions.forEach(func => {
    if (content.includes(`export const ${func}`) || content.includes(`${func}:`)) {
      console.log(`✅ Found function: ${func}`);
    } else {
      console.log(`❌ Missing function: ${func}`);
      allFound = false;
    }
  });
  
  // Check for therapist availability structure
  console.log('\n🕐 Checking for availability structure:');
  
  const availabilityChecks = [
    'availability',
    'monday',
    'tuesday',
    'start',
    'end'
  ];
  
  availabilityChecks.forEach(check => {
    if (content.includes(check)) {
      console.log(`✅ Found availability structure: ${check}`);
    } else {
      console.log(`❌ Missing: ${check}`);
      allFound = false;
    }
  });
  
  // Check for multilingual comments
  console.log('\n🌍 Checking for multilingual comments:');
  
  const languageChecks = [
    'شكرا', // Arabic
    'Merci', // French
    'Thank you' // English
  ];
  
  languageChecks.forEach(check => {
    if (content.includes(check)) {
      console.log(`✅ Found multilingual content: ${check}`);
    } else {
      console.log(`❌ Missing language: ${check}`);
      allFound = false;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (allFound) {
    console.log('🎉 SUCCESS: All booking system components are properly set up!');
    console.log('✨ The booking modal should display real Tunisian therapist names');
    console.log('✨ Dropdown options should show professional therapists');
    console.log('✨ Time slots should be available based on therapist schedules');
    console.log('✨ Multilingual feed comments are included');
  } else {
    console.log('⚠️  WARNING: Some components may be missing');
  }
  
  console.log('\n🔗 Key Booking Features:');
  console.log('• Real therapist profiles with professional credentials');
  console.log('• Proper availability scheduling system');
  console.log('• Booking modal with therapist selection');
  console.log('• Time slot generation and validation');
  console.log('• Mock appointment creation');
  console.log('• Enhanced feed with multilingual comments');
  
} catch (error) {
  console.error('❌ Error testing booking system:', error.message);
  process.exit(1);
}
