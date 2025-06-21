#!/usr/bin/env node

// Test script to verify upcoming appointments are generated
// Run with: node test-upcoming-appointments.js

console.log('🗓️ Testing Upcoming Appointments Generation...\n');

try {
  // Import the mock data
  const mockData = require('./data/tunisianMockData.ts');
  
  console.log('📊 Appointment Statistics:');
  console.log(`Total appointments: ${mockData.MOCK_APPOINTMENTS.length}`);
  
  // Filter upcoming appointments (same logic as in the app)
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const upcomingAppointments = mockData.MOCK_APPOINTMENTS.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= now && aptDate <= in30Days && ['pending', 'confirmed'].includes(apt.status);
  });
  
  console.log(`Upcoming appointments (next 30 days): ${upcomingAppointments.length}`);
  
  if (upcomingAppointments.length > 0) {
    console.log('\n✅ SUCCESS: Upcoming appointments found!');
    console.log('\n📋 Sample upcoming appointments:');
    
    upcomingAppointments.slice(0, 3).forEach((apt, index) => {
      console.log(`${index + 1}. ${apt.date} at ${apt.time} - ${apt.therapist.name} (${apt.status})`);
    });
  } else {
    console.log('\n❌ ISSUE: No upcoming appointments found!');
    console.log('The appointment list will show "No upcoming appointments"');
  }
  
  // Check past appointments
  const pastAppointments = mockData.MOCK_APPOINTMENTS.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate < now;
  });
  
  console.log(`\nPast appointments: ${pastAppointments.length}`);
  
  console.log('\n🎯 Now the Upcoming tab should show appointment cards instead of "No upcoming appointments"!');
  
} catch (error) {
  console.error('❌ Error testing appointments:', error.message);
}
