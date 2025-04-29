import 'react-native-gesture-handler';
import React from 'react';
import RootNavigator from './navigation/RootNavigator';
import { LogBox } from 'react-native';
import { AuthProvider } from './contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { ToastProvider } from './components/ui/ToastContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Provider as PaperProvider } from 'react-native-paper';

LogBox.ignoreLogs(['Warning: ...']);

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider>
        <AuthProvider>
          <ToastProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </ToastProvider>
        </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}