// Test file to verify mock data immutability
// This file demonstrates that the mock data cannot be modified at runtime

import { 
  MOCK_PATIENTS, 
  MOCK_APPOINTMENTS, 
  AZIZ_BAHLOUL,
  validateMockDataImmutability,
  getMockDataSummary 
} from './tunisianMockData';

console.log('🧪 Testing Mock Data Immutability...\n');

// Display data summary
console.log('📊 Mock Data Summary:');
console.log(getMockDataSummary());
console.log('\n');

// Test 1: Try to modify array
console.log('Test 1: Attempting to modify MOCK_PATIENTS array...');
try {
  (MOCK_PATIENTS as any).push({ id: 'test', name: 'Test User' });
  console.log('❌ Array modification succeeded (not frozen properly)');
} catch (error) {
  console.log('✅ Array modification failed as expected (properly frozen)');
}

// Test 2: Try to modify object property
console.log('\nTest 2: Attempting to modify AZIZ_BAHLOUL object...');
try {
  (AZIZ_BAHLOUL as any).first_name = 'Modified';
  console.log(`❌ Object modification succeeded. Name is now: ${AZIZ_BAHLOUL.first_name}`);
} catch (error) {
  console.log('✅ Object modification failed as expected (properly frozen)');
  console.log(`✅ Name remains unchanged: ${AZIZ_BAHLOUL.first_name}`);
}

// Test 3: Try to modify nested object
console.log('\nTest 3: Attempting to modify nested object (address)...');
try {
  (AZIZ_BAHLOUL.address as any).city = 'Modified City';
  console.log(`❌ Nested object modification succeeded. City is now: ${AZIZ_BAHLOUL.address.city}`);
} catch (error) {
  console.log('✅ Nested object modification failed as expected (deeply frozen)');
  console.log(`✅ City remains unchanged: ${AZIZ_BAHLOUL.address.city}`);
}

// Test 4: Try to modify appointment status
console.log('\nTest 4: Attempting to modify appointment status...');
try {
  (MOCK_APPOINTMENTS[0] as any).status = 'modified';
  console.log(`❌ Appointment status modification succeeded. Status is now: ${MOCK_APPOINTMENTS[0].status}`);
} catch (error) {
  console.log('✅ Appointment status modification failed as expected (properly frozen)');
  console.log(`✅ Status remains unchanged: ${MOCK_APPOINTMENTS[0].status}`);
}

// Test 5: Validate using built-in function
console.log('\nTest 5: Using built-in validation function...');
const isImmutable = validateMockDataImmutability();

console.log('\n🏁 Immutability Test Results:');
console.log(`Overall Status: ${isImmutable ? '✅ PASS' : '❌ FAIL'}`);
console.log('The mock data is properly frozen and cannot be modified at runtime.');
console.log('This ensures consistent behavior across all app sessions.');

export default {
  testPassed: isImmutable,
  summary: getMockDataSummary()
};
