//screens/SettingsScreen/components/common/SettingsCard.tsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface SettingsCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ 
  icon, 
  title, 
  description, 
  onPress 
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.icon}>{icon}</Text>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});