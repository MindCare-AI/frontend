import 'react-native-gesture-handler';
import React from 'react';
import RootNavigator from './navigation/RootNavigator';
import { LogBox } from 'react-native';

// Ignore any warnings that might disrupt your debugging
LogBox.ignoreLogs(['Warning: ...']); // Add specific warnings to ignore

export default function App() {
  console.log("App component rendered");
  return <RootNavigator />;
}