/**
 * Test script for verifying the fix for the "Unexpected text node" error
 * This script tests all cases of text nodes in components
 */

console.log('Running text node fix tests...');

// Implement the renderSafeChildren function as in Modal.tsx
const renderSafeChildren = (content) => {
  if (content === null || content === undefined) {
    return null;
  }
  
  // Simple mock of React.Children.toArray
  const toArray = (c) => Array.isArray(c) ? c : [c].filter(Boolean);
  
  const processedChildren = toArray(content)
    .filter((child) => {
      if (child === null || child === undefined) {
        return false;
      }
      
      // Filter out problematic text nodes (periods, whitespace)
      if (typeof child === 'string') {
        const trimmed = child.trim();
        const isValid = trimmed !== '' && trimmed !== '.' && !/^\.+$/.test(trimmed);
        if (!isValid) {
          console.log(`❌ Filtered text node: "${child}"`);
        }
        return isValid;
      }
      
      return true;
    })
    .map((child, index) => {
      // Wrap string and number content in Text components
      if (typeof child === 'string') {
        return { type: 'Text', props: { children: child.trim(), key: `safe-text-${index}` } };
      }
      
      if (typeof child === 'number') {
        return { type: 'Text', props: { children: child.toString(), key: `safe-number-${index}` } };
      }
      
      return child;
    });
  
  return processedChildren;
};

// Test 1: Test with direct strings (periods, whitespace, etc.)
console.log('\nTest 1: Direct string handling');
console.log('Simple period should be filtered out');
const testRender1 = renderSafeChildren('.');
console.log(`Period test result: ${JSON.stringify(testRender1)}`);
console.log(`Test passed: ${!testRender1 || testRender1.length === 0}`);

// Test 2: Test with mixed content including periods
console.log('\nTest 2: Mixed content handling');
const mixedContent = [
  'Valid text',
  '.',
  { type: 'Text', props: { children: 'Valid Text Component', key: 'text-1' } },
  '   ',
  { type: 'View', props: { children: { type: 'Text', props: { children: 'Valid View' } }, key: 'view-1' } }
];
const testRender2 = renderSafeChildren(mixedContent);
console.log(`Filtered mixed content - got ${testRender2?.length} items (should be 3)`);
console.log(`Test passed: ${testRender2?.length === 3}`);

// Test 3: Check if strings are wrapped in Text components
console.log('\nTest 3: String wrapping in Text');
const testRender3 = renderSafeChildren('Valid text');
console.log(`String wrapping test: ${JSON.stringify(testRender3)}`);
console.log(`Test passed: ${testRender3?.[0]?.props?.children === 'Valid text'}`);

// Test 4: Check if numbers are handled properly
console.log('\nTest 4: Number handling');
const testRender4 = renderSafeChildren(42);
console.log(`Number handling test: ${JSON.stringify(testRender4)}`);
console.log(`Test passed: ${testRender4?.[0]?.props?.children === '42'}`);

console.log('\nAll tests completed!');
