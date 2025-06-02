// Mock for react-native-gesture-handler in web environment
export const hasTouchableProperty = () => false;

export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5
};

// Export everything that might be needed
export const gestureHandlerRootHOC = (Component) => Component;
export const GestureHandlerRootView = ({ children }) => children;

// Default export for compatibility
export default {
  hasTouchableProperty,
  State,
  gestureHandlerRootHOC,
  GestureHandlerRootView
};
