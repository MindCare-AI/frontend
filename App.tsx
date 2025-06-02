import 'react-native-gesture-handler';
import './patches/web-polyfill.js';
import React from 'react';
import RootNavigator from './navigation/RootNavigator';
import { LogBox } from 'react-native';
import { AuthProvider } from './contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { ToastProvider } from './components/ui/ToastContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from './theme/ThemeProvider';
import { NativeBaseProvider } from 'native-base';
import { AppointmentProvider } from './contexts/appoint_patient/AppointmentContext';
import { AppContextProvider } from './contexts/appoint_therapist/AppContext';
import { ChatProvider } from './contexts/ChatContext';


// Add specific LogBox ignores for SVG issues
LogBox.ignoreLogs([
  'Warning: ...',
  'hasTouchableProperty',
  'react-native-svg',
  'Svg.render',
  'WebShape.js'
]);

export default function App() {
  return (
    <ErrorBoundary>
      <NativeBaseProvider>
        <ThemeProvider>
          <PaperProvider>
            <AuthProvider>
              <ChatProvider>
                <AppointmentProvider>
                  <AppContextProvider>
                    <ToastProvider>
                      <NavigationContainer>
                        <RootNavigator />
                      </NavigationContainer>
                    </ToastProvider>
                  </AppContextProvider>
                </AppointmentProvider>
              </ChatProvider>
            </AuthProvider>
          </PaperProvider>
        </ThemeProvider>
      </NativeBaseProvider>
    </ErrorBoundary>
  );
}