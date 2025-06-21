// Test script to verify appointment mock data completeness
const mockData = require('./data/tunisianMockData.ts');

console.log('=== APPOINTMENT MOCK DATA VERIFICATION ===\n');

// Check basic data structures
console.log('📊 Basic Data:');
console.log(`- Patients: ${mockData.MOCK_PATIENTS?.length || 0}`);
console.log(`- Therapists: ${mockData.MOCK_THERAPISTS?.length || 0}`);
console.log(`- Total Appointments: ${mockData.MOCK_APPOINTMENTS?.length || 0}`);
console.log(`- Posts with Comments: ${mockData.MOCK_POSTS?.length || 0}`);
console.log(`- Conversations: ${mockData.MOCK_CONVERSATIONS?.length || 0}\n`);

// Check appointment data structure
console.log('📅 Appointment Data:');
if (mockData.MOCK_APPOINTMENT_DATA) {
  console.log(`- Upcoming: ${mockData.MOCK_APPOINTMENT_DATA.upcoming?.length || 0}`);
  console.log(`- Past: ${mockData.MOCK_APPOINTMENT_DATA.past?.length || 0}`);
  console.log(`- Cancelled: ${mockData.MOCK_APPOINTMENT_DATA.cancelled?.length || 0}`);
  console.log(`- Waiting List: ${mockData.MOCK_APPOINTMENT_DATA.waitingList?.length || 0}`);
  console.log(`- Feedback Data: ${mockData.MOCK_APPOINTMENT_DATA.feedback?.length || 0}`);
  console.log(`- Reschedule Requests: ${mockData.MOCK_APPOINTMENT_DATA.rescheduleRequests?.length || 0}`);
  console.log(`- Stats Available: ${mockData.MOCK_APPOINTMENT_DATA.stats ? 'Yes' : 'No'}`);
} else {
  console.log('❌ MOCK_APPOINTMENT_DATA not found');
}

console.log('\n🔧 Exported Functions:');
console.log(`- generateMockAppointments: ${typeof mockData.generateMockAppointments}`);
console.log(`- generateMockMessages: ${typeof mockData.generateMockMessages}`);
console.log(`- getRandomPlaceholderImage: ${typeof mockData.getRandomPlaceholderImage}`);
console.log(`- getAvailableTherapists: ${typeof mockData.getAvailableTherapists}`);

console.log('\n📋 Individual Exports:');
console.log(`- MOCK_WAITING_LIST: ${mockData.MOCK_WAITING_LIST?.length || 0}`);
console.log(`- MOCK_FEEDBACK_DATA: ${mockData.MOCK_FEEDBACK_DATA?.length || 0}`);
console.log(`- MOCK_RESCHEDULE_DATA: ${mockData.MOCK_RESCHEDULE_DATA?.length || 0}`);
console.log(`- MOCK_APPOINTMENT_STATS: ${mockData.MOCK_APPOINTMENT_STATS ? 'Available' : 'Missing'}`);
console.log(`- MOCK_NOTIFICATIONS: ${mockData.MOCK_NOTIFICATIONS?.length || 0}`);

console.log('\n🎯 Key Characters:');
console.log(`- Aziz Bahloul: ${mockData.AZIZ_BAHLOUL ? 'Available' : 'Missing'}`);
console.log(`- Slimen Abyadh: ${mockData.SLIMEN_ABYADH ? 'Available' : 'Missing'}`);

console.log('\n✅ Mock data verification complete!');
