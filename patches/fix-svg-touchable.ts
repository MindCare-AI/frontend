// Fix for hasTouchableProperty issue in react-native-svg with gesture handler
// This polyfill ensures compatibility between react-native-svg and react-native-gesture-handler

import { Platform } from 'react-native';

declare const global: any;

// Polyfill for hasTouchableProperty
(function setupSvgTouchablePolyfill() {
  if (typeof global !== 'undefined') {
    // Store original require
    const originalRequire = global.require || require;
    
    // Create a patched require function
    function patchedRequire(id: string): any {
      const module = originalRequire(id);
      
      // Patch react-native-gesture-handler
      if (id === 'react-native-gesture-handler' && module) {
        if (typeof module.hasTouchableProperty === 'undefined') {
          module.hasTouchableProperty = function() {
            return false; // Return false to indicate no touchable property
          };
        }
        
        // Ensure State object exists for gesture handler
        if (!module.State && typeof module.gestureHandlerRootHOC !== 'undefined') {
          module.State = {
            UNDETERMINED: 0,
            FAILED: 1,
            BEGAN: 2,
            CANCELLED: 3,
            ACTIVE: 4,
            END: 5
          };
        }
      }
      
      return module;
    }
    
    // Replace global require if available
    if (global.require) {
      global.require = patchedRequire;
    }
    
    // For React Native environments
    if (Platform.OS !== 'web') {
      try {
        const gestureHandler = require('react-native-gesture-handler');
        if (gestureHandler && typeof gestureHandler.hasTouchableProperty === 'undefined') {
          gestureHandler.hasTouchableProperty = () => false;
        }
      } catch (error) {
        console.warn('Could not patch gesture handler:', (error as Error).message || 'Unknown error');
      }
    }
  }
})();

// Additional SVG compatibility fixes
if (typeof global !== 'undefined' && (global as any).__DEV__) {
  // Suppress SVG-related warnings in development
  const originalConsoleWarn = console.warn;
  console.warn = function(...args) {
    const message = args.join(' ');
    if (
      message.includes('hasTouchableProperty') ||
      message.includes('react-native-svg') ||
      message.includes('WebShape.js')
    ) {
      return; // Suppress these specific warnings
    }
    originalConsoleWarn.apply(console, args);
  };
}
