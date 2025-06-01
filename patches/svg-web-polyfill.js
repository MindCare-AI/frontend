// SVG Web Polyfill for React Native Web
// This fixes the hasTouchableProperty error when using react-native-svg on web

import { Platform } from 'react-native';

// Apply polyfill immediately for web
if (Platform.OS === 'web') {
  // First, try to polyfill global hasTouchableProperty
  if (typeof global !== 'undefined') {
    // Create a global polyfill
    if (!global.hasTouchableProperty) {
      global.hasTouchableProperty = () => false;
    }
    
    // Store original require
    const originalRequire = global.require || require;
    
    // Create a patched require function
    global.require = function(id) {
      const module = originalRequire.apply(this, arguments);
      
      if (id === 'react-native-gesture-handler' && module) {
        if (typeof module.hasTouchableProperty === 'undefined') {
          module.hasTouchableProperty = () => false;
        }
      }
      
      return module;
    };
  }

  // Also patch the module directly if it exists
  try {
    const gestureHandler = require('react-native-gesture-handler');
    if (gestureHandler && typeof gestureHandler.hasTouchableProperty === 'undefined') {
      gestureHandler.hasTouchableProperty = () => false;
    }
  } catch (error) {
    // Gesture handler might not be available, that's okay
    console.log('Gesture handler not available, using polyfill');
  }

  // Additional polyfill for window object
  if (typeof window !== 'undefined') {
    window.hasTouchableProperty = () => false;
  }
}

export default function applyWebPolyfills() {
  // This function can be called explicitly if needed
  if (Platform.OS === 'web') {
    console.log('SVG web polyfills applied');
  }
}
