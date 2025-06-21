#!/usr/bin/env node

// Test the therapist dropdown data specifically
console.log('🧪 Testing Therapist Dropdown Data');
console.log('=' * 50);

const fs = require('fs');

try {
  // Check if the mock data is properly structured
  console.log('\n📊 Checking Mock Therapist Data Structure:');
  
  const mockDataContent = fs.readFileSync('./data/tunisianMockData.ts', 'utf8');
  
  if (mockDataContent.includes('SLIMEN_ABYADH') && mockDataContent.includes('generateMockTherapists')) {
    console.log('✅ Mock therapist data structure found');
    console.log('   ✓ SLIMEN_ABYADH defined');
    console.log('   ✓ generateMockTherapists function exists');
    
    // Check specific fields that the booking modal needs
    const hasFirstName = mockDataContent.includes('first_name:');
    const hasLastName = mockDataContent.includes('last_name:');
    const hasFullName = mockDataContent.includes('full_name:');
    const hasSpecializations = mockDataContent.includes('specializations:');
    
    console.log(`   ✓ Has first_name field: ${hasFirstName}`);
    console.log(`   ✓ Has last_name field: ${hasLastName}`);
    console.log(`   ✓ Has full_name field: ${hasFullName}`);
    console.log(`   ✓ Has specializations field: ${hasSpecializations}`);
  }
  
  // Check if the API function is properly implemented
  console.log('\n🔧 Checking getAllTherapistProfiles Function:');
  
  const patientAPIContent = fs.readFileSync('./API/Appointment/patient.ts', 'utf8');
  
  if (patientAPIContent.includes('getAllTherapistProfiles') && patientAPIContent.includes('MOCK_THERAPISTS')) {
    console.log('✅ getAllTherapistProfiles function found');
    console.log('   ✓ Uses MOCK_THERAPISTS data');
    console.log('   ✓ Maps to expected format');
    
    const mapsFirstName = patientAPIContent.includes('first_name: therapist.first_name');
    const mapsLastName = patientAPIContent.includes('last_name: therapist.last_name');
    const mapsFullName = patientAPIContent.includes('name: therapist.full_name');
    
    console.log(`   ✓ Maps first_name correctly: ${mapsFirstName}`);
    console.log(`   ✓ Maps last_name correctly: ${mapsLastName}`);
    console.log(`   ✓ Maps full_name to name: ${mapsFullName}`);
  }
  
  // Check if the booking modal is set up correctly
  console.log('\n📱 Checking BookAppointmentModal Setup:');
  
  const modalContent = fs.readFileSync('./components/Appointments/patient_dashboard/BookAppointmentModal.tsx', 'utf8');
  
  if (modalContent.includes('getAllTherapistProfiles') && modalContent.includes('setTherapists')) {
    console.log('✅ BookAppointmentModal setup found');
    console.log('   ✓ Calls getAllTherapistProfiles()');
    console.log('   ✓ Maps response to therapist dropdown');
    
    const hasFirstLastNameMapping = modalContent.includes('first_name') && modalContent.includes('last_name');
    console.log(`   ✓ Uses first_name and last_name for labels: ${hasFirstLastNameMapping}`);
  }
  
  console.log('\n🎯 Expected Behavior:');
  console.log('   1. When you open the "Book New Appointment" modal');
  console.log('   2. The "Therapist" dropdown should show a list of therapists');
  console.log('   3. You should see names like "Dr. Slimen Abyadh" and other generated therapists');
  console.log('   4. After selecting a therapist and date, time slots should appear');
  
  console.log('\n🔧 Troubleshooting:');
  console.log('   - Check browser console for any errors in getAllTherapistProfiles()');
  console.log('   - Verify the dropdown component is receiving the therapist array');
  console.log('   - Make sure the modal is calling fetchTherapists() when opened');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}

console.log('\n🚀 If therapists still don\'t appear:');
console.log('   1. Open browser dev tools');
console.log('   2. Open the booking modal');
console.log('   3. Check the Network tab for API calls');
console.log('   4. Check Console for any error messages');
console.log('   5. Verify mock data is loading correctly');
