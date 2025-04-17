import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Appbar, Button, ActivityIndicator, useTheme, Switch, Divider } from 'react-native-paper';
import { NotificationPreferenceItem } from './components/NotificationPreferenceItem';
import { useNotificationPreferences } from './hooks/useNotificationPreferences';
import { NavigationProp } from '@react-navigation/native';

interface NotificationPreferencesScreenProps {
  navigation: NavigationProp<any>;
}

export const NotificationPreferencesScreen: React.FC<NotificationPreferencesScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { 
    preferences, 
    loading, 
    error, 
    togglePreference, 
    savePreferences,
    emailNotifications,
    inAppNotifications,
    toggleEmailNotifications,
    toggleInAppNotifications,
    disabledTypes,
    toggleDisabledType,
  } = useNotificationPreferences();

  const [localPrefs, setLocalPrefs] = React.useState(preferences);
  const [localEmail, setLocalEmail] = React.useState(emailNotifications);
  const [localInApp, setLocalInApp] = React.useState(inAppNotifications);

  React.useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  React.useEffect(() => {
    setLocalEmail(emailNotifications);
  }, [emailNotifications]);

  React.useEffect(() => {
    setLocalInApp(inAppNotifications);
  }, [inAppNotifications]);

  const handleSave = async () => {
    try {
      await savePreferences({
        notification_preferences: localPrefs,
        email_notifications: localEmail,
        in_app_notifications: localInApp,
        disabled_notification_types: disabledTypes,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !localPrefs) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Failed to load preferences'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Notification Preferences" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Notification Types
        </Text>

        {localPrefs.map(preference => (
          <NotificationPreferenceItem
            key={preference.type}
            type={preference.type}
            description={preference.description}
            isEnabled={preference.isEnabled}
            onToggle={() => {
              setLocalPrefs(prev => 
                prev.map(p => 
                  p.type === preference.type 
                    ? { ...p, isEnabled: !p.isEnabled } 
                    : p
                )
              );
            }}
          />
        ))}

        <Divider style={{ marginVertical: 16 }} />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Channels
        </Text>
        <View style={styles.row}>
          <Text>Email Notifications</Text>
          <Switch
            value={localEmail}
            onValueChange={val => setLocalEmail(val)}
          />
        </View>
        <View style={styles.row}>
          <Text>In-App Notifications</Text>
          <Switch
            value={localInApp}
            onValueChange={val => setLocalInApp(val)}
          />
        </View>

        <Button 
          mode="contained" 
          onPress={handleSave}
          style={styles.saveButton}
        >
          Save Preferences
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});