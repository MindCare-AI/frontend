// Web gesture handler polyfill
// This must be imported before any component that uses react-native-svg

// Polyfill the hasTouchableProperty function for web environments
if (typeof window !== 'undefined') {
  // Check if we're in a web environment
  const polyfillHasTouchableProperty = () => {
    // Define the function that react-native-svg is looking for
    const hasTouchableProperty = () => false;
    
    // Add it to various possible locations
    if (typeof global !== 'undefined') {
      global.hasTouchableProperty = hasTouchableProperty;
    }
    
    if (typeof window !== 'undefined') {
      window.hasTouchableProperty = hasTouchableProperty;
    }
    
    // Try to patch the gesture handler module
    try {
      const originalRequire = window.require || require;
      if (originalRequire) {
        // Override require to inject our polyfill
        const patchedRequire = (id) => {
          const module = originalRequire(id);
          if (id === 'react-native-gesture-handler' && module) {
            if (!module.hasTouchableProperty) {
              module.hasTouchableProperty = hasTouchableProperty;
            }
          }
          return module;
        };
        
        // Copy over any existing properties
        Object.setPrototypeOf(patchedRequire, originalRequire);
        Object.assign(patchedRequire, originalRequire);
        
        if (window.require) {
          window.require = patchedRequire;
        }
      }
    } catch (error) {
      console.warn('Could not patch require function:', error);
    }
  };
  
  // Apply the polyfill immediately
  polyfillHasTouchableProperty();
  
  // Also apply it when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', polyfillHasTouchableProperty);
  }
}
