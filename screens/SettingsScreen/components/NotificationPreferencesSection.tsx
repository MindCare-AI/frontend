import React from 'react';
import { View } from 'react-native';
import { Surface, Text, Switch, Divider } from 'react-native-paper';

interface NotificationPreferencesSectionProps {
  preferences: NotificationPreferences;
  onUpdate: (field: keyof NotificationPreferences, value: any) => void;
}

export const NotificationPreferencesSection: React.FC<NotificationPreferencesSectionProps> = ({
  preferences,
  onUpdate,
}) => {
  return (
    <Surface style={styles.card}>
      <Text style={styles.cardTitle}>Notification Preferences</Text>
      <Divider style={styles.divider} />
      
      <View style={styles.switchRow}>
        <Text>Email Notifications</Text>
        <Switch
          value={preferences.email_notifications}
          onValueChange={(value) => onUpdate('email_notifications', value)}
        />
      </View>
      
      <View style={styles.switchRow}>
        <Text>In-App Notifications</Text>
        <Switch
          value={preferences.in_app_notifications}
          onValueChange={(value) => onUpdate('in_app_notifications', value)}
        />
      </View>
    </Surface>
  );
};