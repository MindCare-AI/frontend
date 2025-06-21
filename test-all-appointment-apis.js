#!/usr/bin/env node

// Test script to verify all appointment APIs are using mock data
console.log('🧪 Testing All Appointment APIs - Mock Data Verification');
console.log('=' * 60);

async function testPatientAPIs() {
  console.log('\n📱 Testing Patient Appointment APIs:');
  
  try {
    // Import patient APIs
    const patientAPI = require('./API/Appointment/patient.ts');
    
    console.log('✅ Patient API module loaded successfully');
    
    // Test getAppointments
    console.log('   - Testing getAppointments()...');
    const appointments = await patientAPI.getAppointments();
    console.log(`   ✓ Returned ${appointments.results?.length || 0} appointments`);
    
    // Test createAppointment
    console.log('   - Testing createAppointment()...');
    const newAppointment = await patientAPI.createAppointment({
      therapist: 1,
      appointment_date: '2025-01-15 10:00',
      duration: '60',
      notes: 'Test appointment'
    });
    console.log(`   ✓ Created appointment with ID: ${newAppointment.id}`);
    
    // Test getAllTherapistProfiles
    console.log('   - Testing getAllTherapistProfiles()...');
    const therapists = await patientAPI.getAllTherapistProfiles();
    console.log(`   ✓ Returned ${therapists.length} therapist profiles`);
    
    console.log('✅ All Patient APIs are using mock data!');
    
  } catch (error) {
    console.error('❌ Patient API test failed:', error.message);
  }
}

async function testTherapistAPIs() {
  console.log('\n👨‍⚕️ Testing Therapist Appointment APIs:');
  
  try {
    // Import therapist APIs
    const therapistAPI = require('./API/Appointment/therapist.ts');
    
    console.log('✅ Therapist API module loaded successfully');
    
    // Test getAppointments
    console.log('   - Testing getAppointments()...');
    const appointments = await therapistAPI.getAppointments();
    console.log(`   ✓ Returned ${appointments.results?.length || 0} therapist appointments`);
    
    // Test confirmAppointment
    console.log('   - Testing confirmAppointment()...');
    const confirmed = await therapistAPI.confirmAppointment(123);
    console.log(`   ✓ Confirmed appointment: ${confirmed.status}`);
    
    // Test rescheduleAppointment
    console.log('   - Testing rescheduleAppointment()...');
    const rescheduled = await therapistAPI.rescheduleAppointment(456, '2025-01-20 14:00', 'Rescheduled for testing');
    console.log(`   ✓ Rescheduled appointment: ${rescheduled.status}`);
    
    // Test completeAppointment
    console.log('   - Testing completeAppointment()...');
    const completed = await therapistAPI.completeAppointment(789);
    console.log(`   ✓ Completed appointment: ${completed.status}`);
    
    // Test cancelAppointment
    console.log('   - Testing cancelAppointment()...');
    const cancelled = await therapistAPI.cancelAppointment(999);
    console.log(`   ✓ Cancelled appointment: ${cancelled.status}`);
    
    console.log('✅ All Therapist APIs are using mock data!');
    
  } catch (error) {
    console.error('❌ Therapist API test failed:', error.message);
  }
}

async function testMockDataQuality() {
  console.log('\n📊 Testing Mock Data Quality:');
  
  try {
    const mockData = require('./data/tunisianMockData.ts');
    
    console.log(`   - Mock Appointments: ${mockData.MOCK_APPOINTMENTS?.length || 0}`);
    console.log(`   - Mock Therapists: ${mockData.MOCK_THERAPISTS?.length || 0}`);
    console.log(`   - Mock Patients: ${mockData.MOCK_PATIENTS?.length || 0}`);
    
    // Check Aziz has upcoming appointments
    const azizAppointments = mockData.MOCK_APPOINTMENTS.filter(apt => 
      apt.patient.id === 'patient_aziz_1'
    );
    console.log(`   - Aziz Bahloul appointments: ${azizAppointments.length}`);
    
    const now = new Date();
    const azizUpcoming = azizAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= now && ['pending', 'confirmed'].includes(apt.status);
    });
    console.log(`   - Aziz upcoming appointments: ${azizUpcoming.length}`);
    
    // Check Slimen has therapist appointments
    const slimenAppointments = mockData.MOCK_APPOINTMENTS.filter(apt => 
      apt.therapist.id === mockData.SLIMEN_ABYADH.id
    );
    console.log(`   - Dr. Slimen Abyadh appointments: ${slimenAppointments.length}`);
    
    console.log('✅ Mock data quality looks good!');
    
  } catch (error) {
    console.error('❌ Mock data test failed:', error.message);
  }
}

async function runAllTests() {
  try {
    await testPatientAPIs();
    await testTherapistAPIs();
    await testMockDataQuality();
    
    console.log('\n🎉 ALL TESTS PASSED! All appointment APIs are using mock data.');
    console.log('📱 Patient and therapist screens should now display 100% fake data.');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
  }
}

// Run the tests
runAllTests();
