// Test script to verify mock data structure and comments
const ts = require('typescript');
const fs = require('fs');
const path = require('path');

console.log('Testing mock data structure...');

// Read and compile TypeScript file
const mockDataPath = path.join(__dirname, 'data', 'tunisianMockData.ts');
const source = fs.readFileSync(mockDataPath, 'utf8');

try {
  // Compile TypeScript to JavaScript
  const result = ts.transpile(source, {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2018,
    strict: false
  });
  
  // Write compiled JS to a temporary file
  const tempPath = path.join(__dirname, 'temp-mock-data.js');
  fs.writeFileSync(tempPath, result);
  
  // Import the compiled module
  const mockData = require('./temp-mock-data.js');
  
  if (mockData.MOCK_POSTS) {
    const posts = mockData.MOCK_POSTS;
    console.log('Number of mock posts:', posts.length);
    
    if (posts.length > 0) {
      const firstPost = posts[0];
      console.log('First post ID:', firstPost.id);
      console.log('First post has comments:', firstPost.comments ? firstPost.comments.length : 'NO COMMENTS');
      
      if (firstPost.comments && firstPost.comments.length > 0) {
        console.log('First comment content:', firstPost.comments[0].content);
        console.log('First comment author:', firstPost.comments[0].author.full_name);
      }
      
      // Test a few more posts
      for (let i = 0; i < Math.min(5, posts.length); i++) {
        const post = posts[i];
        console.log(`Post ${post.id}: ${post.comments ? post.comments.length : 0} comments`);
      }
    }
  } else {
    console.log('MOCK_POSTS not found in exports');
    console.log('Available exports:', Object.keys(mockData));
  }
  
  // Clean up
  fs.unlinkSync(tempPath);
  
} catch (error) {
  console.error('Error testing mock data:', error.message);
}

console.log('Mock data test completed.');
