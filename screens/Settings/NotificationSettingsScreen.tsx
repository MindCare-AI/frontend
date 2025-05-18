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
  const [originalSettings, setOriginalSettings] = useState<NotificationSettings>({});
  const [settings, setSettings] = useState<NotificationSettings>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotificationSettings();
      setSettings(data);
      setOriginalSettings(data);
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to load notification settings:', err);
      setError('Failed to load notification settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    const updatedSettings = {
      ...settings,
      [key]: !settings[key],
    };
    
    setSettings(updatedSettings);
    
    // Check if any setting is different from original
    const hasAnyChange = Object.keys(updatedSettings).some(
      settingKey => updatedSettings[settingKey as keyof NotificationSettings] !== 
                    originalSettings[settingKey as keyof NotificationSettings]
    );
    
    setHasChanges(hasAnyChange);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      await updateNotificationSettings(settings);
      setOriginalSettings(settings);
      setHasChanges(false);
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

  const handleCancel = () => {
    setSettings(originalSettings);
    setHasChanges(false);
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
      
      {hasChanges && (
        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={handleCancel} 
            style={styles.cancelButton} 
            disabled={updating}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSave} 
            style={styles.saveButton} 
            loading={updating}
            disabled={updating}
          >
            Save Changes
          </Button>
        </View>
      )}
      
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
    paddingBottom: 80, // Add padding at the bottom for the buttons
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: globalStyles.colors.background,
    borderTopWidth: 1,
    borderTopColor: globalStyles.colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: globalStyles.colors.primary,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  }
});

export default NotificationSettingsScreen;