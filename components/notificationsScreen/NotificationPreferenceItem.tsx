import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, Text } from 'react-native-paper';

// Backend supports notification_preferences and disabled_notification_types in User Preferences.
// This component should be used to toggle individual notification types.

interface NotificationPreferenceItemProps {
  type: string; // e.g., "email_notifications", "in_app_notifications", or a notification type string from backend
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
  // Format type label to match backend API types (capitalize each word)
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
        accessibilityLabel={`Toggle ${formattedType} notification`}
        color="#4a90e2"
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
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    marginBottom: 8,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  type: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});