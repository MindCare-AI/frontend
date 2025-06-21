// Test script to debug comments loading
const fs = require('fs');
const path = require('path');

// Read the mock data file
const mockDataPath = path.join(__dirname, 'data', 'tunisianMockData.ts');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

// Mock the exports to simulate what the hook would see
const mockPosts = [];

// Parse the content to extract post generation logic
console.log('Mock data file size:', mockDataContent.length);
console.log('Contains MOCK_POSTS export:', mockDataContent.includes('export const MOCK_POSTS'));
console.log('Contains generateMockPosts:', mockDataContent.includes('generateMockPosts'));

// Test the ID conversion logic that would happen in the hooks
const testPostIds = [1, 2, 3, 4, 5];

testPostIds.forEach(postId => {
  const originalPostId = `post_${postId}`;
  const postIdStr = postId.toString();
  
  console.log(`Testing post ID ${postId}:`);
  console.log(`  - Numeric string: ${postIdStr}`);
  console.log(`  - Original format: ${originalPostId}`);
  console.log(`  - Would match "post_1": ${originalPostId === 'post_1'}`);
  console.log('');
});

console.log('Comments debug test completed.');
