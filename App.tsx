import 'react-native-gesture-handler';
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

// If you want to use DotLottieReact globally, import it here
// import { DotLottieReact } from '@lottiefiles/dotlottie-react-native';

LogBox.ignoreLogs(['Warning: ...']);

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