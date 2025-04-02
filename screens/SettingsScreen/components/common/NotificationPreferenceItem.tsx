//screens/SettingsScreen/components/common/NotificationPreferenceItem.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, Text } from 'react-native-paper';

interface NotificationPreferenceItemProps {
  label: string;
  isEnabled: boolean;
  onToggle: () => void;
}

export const NotificationPreferenceItem: React.FC<NotificationPreferenceItemProps> = ({
  label,
  isEnabled,
  onToggle,
}) => {
  const formattedLabel = label
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{formattedLabel}</Text>
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        color="#4CAF50"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
});