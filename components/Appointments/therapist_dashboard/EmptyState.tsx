import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, message }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={48} color="#BDBDBD" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 12,
  },
  message: {
    color: '#757575',
    textAlign: 'center',
  },
});

export default EmptyState;