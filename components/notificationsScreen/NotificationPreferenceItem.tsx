import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { globalStyles } from '../../styles/global';

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
        thumbColor={isEnabled ? globalStyles.colors.primary : globalStyles.colors.neutralMedium}
        trackColor={{ 
          false: globalStyles.colors.neutralLight, 
          true: `${globalStyles.colors.primary}40` 
        }}
        accessibilityLabel={`Toggle ${formattedType} notification`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: globalStyles.colors.white,
    borderRadius: 12,
    shadowColor: globalStyles.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: globalStyles.colors.primary,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    color: globalStyles.colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: globalStyles.colors.textSecondary,
    lineHeight: 20,
  },
});