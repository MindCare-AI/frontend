import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Appbar, Button, ActivityIndicator, useTheme, Switch, Divider } from 'react-native-paper';
import { NotificationPreferenceItem } from '../../components/notificationsScreen/NotificationPreferenceItem';
import { useNotificationPreferences } from '../../hooks/notificationsScreen/useNotificationPreferences';
import { NavigationProp } from '@react-navigation/native';
import { globalStyles } from '../../styles/global';

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
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title="Notification Preferences" 
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Notification Types
          </Text>
          <Text style={styles.sectionDescription}>
            Choose which types of notifications you want to receive
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
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Notification Channels
          </Text>
          <Text style={styles.sectionDescription}>
            Select how you want to receive notifications
          </Text>
          
          <View style={styles.channelCard}>
            <View style={styles.row}>
              <View style={styles.channelInfo}>
                <Text style={styles.channelTitle}>Email Notifications</Text>
                <Text style={styles.channelDescription}>Receive notifications via email</Text>
              </View>
              <Switch
                value={localEmail}
                onValueChange={val => setLocalEmail(val)}
                thumbColor={localEmail ? globalStyles.colors.primary : globalStyles.colors.neutralMedium}
                trackColor={{ 
                  false: globalStyles.colors.neutralLight, 
                  true: `${globalStyles.colors.primary}40` 
                }}
              />
            </View>
          </View>
          
          <View style={styles.channelCard}>
            <View style={styles.row}>
              <View style={styles.channelInfo}>
                <Text style={styles.channelTitle}>In-App Notifications</Text>
                <Text style={styles.channelDescription}>Show notifications within the app</Text>
              </View>
              <Switch
                value={localInApp}
                onValueChange={val => setLocalInApp(val)}
                thumbColor={localInApp ? globalStyles.colors.primary : globalStyles.colors.neutralMedium}
                trackColor={{ 
                  false: globalStyles.colors.neutralLight, 
                  true: `${globalStyles.colors.primary}40` 
                }}
              />
            </View>
          </View>
        </View>

        <Button 
          mode="contained" 
          onPress={handleSave}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
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
    backgroundColor: globalStyles.colors.background,
  },
  header: {
    backgroundColor: globalStyles.colors.primary,
    elevation: 4,
    shadowColor: globalStyles.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    color: globalStyles.colors.white,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 8,
    fontSize: 20,
    fontWeight: 'bold',
    color: globalStyles.colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: globalStyles.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  divider: {
    marginVertical: 24,
    backgroundColor: globalStyles.colors.border,
  },
  channelCard: {
    backgroundColor: globalStyles.colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: globalStyles.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  channelInfo: {
    flex: 1,
    marginRight: 16,
  },
  channelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: globalStyles.colors.text,
    marginBottom: 4,
  },
  channelDescription: {
    fontSize: 14,
    color: globalStyles.colors.textSecondary,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: globalStyles.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: globalStyles.colors.background,
  },
  errorText: {
    color: globalStyles.colors.error,
    textAlign: 'center',
    fontSize: 16,
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: globalStyles.colors.primary,
    borderRadius: 12,
    paddingVertical: 4,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: globalStyles.colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '500',
    color: globalStyles.colors.text,
  },
});