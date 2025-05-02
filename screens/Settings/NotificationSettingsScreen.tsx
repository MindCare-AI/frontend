import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Text } from 'react-native';
import { ActivityIndicator, Snackbar, Button } from 'react-native-paper';
import { getNotificationSettings, updateNotificationSettings } from '../../API/settings/notifications';
import { SettingToggle } from '../../components/SettingsScreen/SettingToggle';
import { SectionHeader } from '../../components/SettingsScreen/SectionHeader';
import { globalStyles } from '../../styles/global';

interface NotificationSettings {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  appointments?: boolean;
  messaging?: boolean;
  marketingUpdates?: boolean;
}

const NotificationSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotificationSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load notification settings:', err);
      setError('Failed to load notification settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationSettings) => {
    try {
      setUpdating(true);
      const updatedValue = !settings[key];
      
      const updatedSettings = {
        ...settings,
        [key]: updatedValue,
      };
      
      await updateNotificationSettings({ [key]: updatedValue });
      setSettings(updatedSettings);
      
      setSnackbarMessage('Notification settings updated');
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Failed to update notification settings:', err);
      setSnackbarMessage('Failed to update settings. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={globalStyles.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="contained" onPress={loadSettings} style={styles.retryButton}>
              Retry
            </Button>
          </View>
        ) : (
          <>
            <SectionHeader 
              title="Notification Channels" 
              description="Choose how you'd like to be notified" 
            />
            
            <SettingToggle
              label="Push Notifications"
              value={settings.push ?? false}
              onToggle={() => handleToggle('push')}
              disabled={updating}
              description="In-app notifications on your device"
            />
            
            <SettingToggle
              label="Email Notifications"
              value={settings.email ?? false}
              onToggle={() => handleToggle('email')}
              disabled={updating}
              description="Get important updates via email"
            />
            
            <SettingToggle
              label="SMS Notifications"
              value={settings.sms ?? false}
              onToggle={() => handleToggle('sms')}
              disabled={updating}
              description="Get notifications via text message"
            />
            
            <SectionHeader 
              title="Notification Types" 
              description="Select which events you want to be notified about" 
            />
            
            <SettingToggle
              label="Appointments"
              value={settings.appointments ?? false}
              onToggle={() => handleToggle('appointments')}
              disabled={updating}
              description="Reminders for upcoming appointments"
            />
            
            <SettingToggle
              label="Messages"
              value={settings.messaging ?? false}
              onToggle={() => handleToggle('messaging')}
              disabled={updating}
              description="Notifications for new messages"
            />
            
            <SettingToggle
              label="Marketing Updates"
              value={settings.marketingUpdates ?? false}
              onToggle={() => handleToggle('marketingUpdates')}
              disabled={updating}
              description="Get news and promotional content"
            />
          </>
        )}
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: globalStyles.colors.error,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: globalStyles.colors.primary,
  },
});

export default NotificationSettingsScreen;