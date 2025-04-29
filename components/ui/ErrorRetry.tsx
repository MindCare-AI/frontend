import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface ErrorRetryProps {
  message: string;
  onRetry: () => void;
  icon?: string;
}

const ErrorRetry = ({ message, onRetry, icon = 'refresh-circle' }: ErrorRetryProps) => {
  return (
    <View style={styles.container}>
      <Icon name="alert-circle" size={50} color="#FF3B30" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Icon name={icon} size={16} color="#fff" />
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8'
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  }
});

export default ErrorRetry;
