import { MD3LightTheme } from 'react-native-paper';

// Declare module augmentation first
declare global {
  namespace ReactNativePaper {
    interface Theme {
      custom: {
        pending: string;
        confirmed: string;
        completed: string;
        rescheduled: string;
        expired: string;
      };
    }
  }
}

// Define our custom theme WITHOUT explicitly typing it as MD3Theme
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#003366',
    secondary: '#4CAF50',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#B00020',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#000000',
    onSurface: '#000000',
    onError: '#FFFFFF',
  },
  // Add custom colors for our application
  custom: {
    pending: '#FFC107',
    confirmed: '#4CAF50',
    completed: '#2196F3',
    rescheduled: '#9C27B0',
    expired: '#F44336',
  },
};

// Export the theme type using typeof
export type AppTheme = typeof theme;