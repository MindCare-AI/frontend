// Web-specific polyfill that must run before any other imports
// This file should be imported first in index.ts

// Immediately check if we're in a web environment
if (typeof window !== 'undefined') {
  console.log('Applying web polyfills for React Native SVG...');
  
  // Define the missing function
  const hasTouchableProperty = () => false;
  
  // Apply to global scope
  if (typeof global !== 'undefined') {
    global.hasTouchableProperty = hasTouchableProperty;
  }
  
  // Apply to window
  window.hasTouchableProperty = hasTouchableProperty;
  
  // Create a mock gesture handler module
  const mockGestureHandler = {
    hasTouchableProperty,
    // Add other common gesture handler exports that might be needed
    State: {
      UNDETERMINED: 0,
      FAILED: 1,
      BEGAN: 2,
      CANCELLED: 3,
      ACTIVE: 4,
      END: 5
    }
  };
  
  // Override module resolution for react-native-gesture-handler
  const originalRequire = window.require || require;
  
  if (originalRequire) {
    const moduleCache = new Map();
    
    window.require = function(moduleName) {
      if (moduleName === 'react-native-gesture-handler') {
        if (!moduleCache.has(moduleName)) {
          try {
            const originalModule = originalRequire(moduleName);
            // Merge with our mock to ensure hasTouchableProperty exists
            const enhancedModule = {
              ...originalModule,
              ...mockGestureHandler,
              hasTouchableProperty
            };
            moduleCache.set(moduleName, enhancedModule);
            return enhancedModule;
          } catch (error) {
            // If the original module fails to load, return our mock
            moduleCache.set(moduleName, mockGestureHandler);
            return mockGestureHandler;
          }
        }
        return moduleCache.get(moduleName);
      }
      
      // For all other modules, use the original require
      return originalRequire.apply(this, arguments);
    };
    
    // Copy properties from original require
    Object.setPrototypeOf(window.require, originalRequire);
    Object.assign(window.require, originalRequire);
  }
  
  // Also patch Node.js style require if available
  if (typeof global !== 'undefined' && global.require) {
    const originalGlobalRequire = global.require;
    global.require = function(moduleName) {
      if (moduleName === 'react-native-gesture-handler') {
        try {
          const originalModule = originalGlobalRequire(moduleName);
          return {
            ...originalModule,
            ...mockGestureHandler,
            hasTouchableProperty
          };
        } catch (error) {
          return mockGestureHandler;
        }
      }
      return originalGlobalRequire.apply(this, arguments);
    };
    
    Object.setPrototypeOf(global.require, originalGlobalRequire);
    Object.assign(global.require, originalGlobalRequire);
  }
  
  console.log('Web polyfills applied successfully');
}
