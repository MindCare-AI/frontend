//screens/SettingsScreen/components/NotificationPreferencesSection.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, Switch, Divider, TextInput } from 'react-native-paper';

export interface NotificationPreferences {
  dark_mode: boolean;
  language: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  disabled_notification_types: string[]; // stored as array of strings
  notification_preferences: Record<string, any>;
}

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

      <Divider style={styles.divider} />
      
      <Text style={styles.sectionLabel}>Disabled Notification Types</Text>
      <TextInput
        mode="outlined"
        placeholder="Comma-separated types"
        value={preferences.disabled_notification_types.join(', ')}
        onChangeText={(text) => {
          // Split comma separated string into an array and trim entries
          const types = text.split(',').map(s => s.trim()).filter(Boolean);
          onUpdate('disabled_notification_types', types);
        }}
        style={styles.inputField}
      />

      <Text style={styles.sectionLabel}>Notification Preferences (JSON)</Text>
      <TextInput
        mode="outlined"
        placeholder='e.g. {"sound": true, "vibrate": false}'
        value={JSON.stringify(preferences.notification_preferences)}
        onChangeText={(text) => {
          try {
            const json = JSON.parse(text);
            onUpdate('notification_preferences', json);
          } catch (err) {
            // You might want to show an error in a real implementation
          }
        }}
        style={styles.inputField}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    elevation: 4,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
    height: 1,
    backgroundColor: '#ccc',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  inputField: {
    marginBottom: 12,
  },
});