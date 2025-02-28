//components/Input.tsx
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

export default function Input({ placeholder, value, onChangeText, secureTextEntry }: InputProps) {
  return <TextInput style={styles.input} placeholder={placeholder} value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry} />;
}

const styles = StyleSheet.create({
  input: {
    width: '80%',
    padding: 12,
    marginVertical: 10,
    borderBottomWidth: 1,
  },
});
