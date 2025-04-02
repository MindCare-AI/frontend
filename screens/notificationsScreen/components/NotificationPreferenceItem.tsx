import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, Text } from 'react-native-paper';

interface NotificationPreferenceItemProps {
  type: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
}

export const NotificationPreferenceItem: React.FC<NotificationPreferenceItemProps> = ({
  type,
  description,
  isEnabled,
  onToggle,
}) => {
  const formattedType = type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.type}>{formattedType}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  type: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});