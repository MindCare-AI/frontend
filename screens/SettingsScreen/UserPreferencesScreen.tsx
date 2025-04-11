//screens/SettingsScreen/UserPreferencesScreen.tsx
import React, { useRef } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Button, Text, Switch, IconButton, ActivityIndicator } from 'react-native-paper';
import { NavigationProp } from '@react-navigation/native';
import { usePreferences } from './hooks/common/usePreferences';
import { NotificationPreferenceItem } from './components/common/NotificationPreferenceItem';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface Preferences {
  dark_mode: boolean;
  language: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  disabled_notification_types: string[];
  notification_preferences?: string; // mark as optional
}

interface UserPreferencesScreenProps {
  navigation: NavigationProp<any>;
}

export const UserPreferencesScreen: React.FC<UserPreferencesScreenProps> = ({ navigation }) => {
  const { preferences, savePreferences, loading } = usePreferences();
  const [localPrefs, setLocalPrefs] = React.useState<Preferences | null>(preferences);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  // Create ref for GSAP animation
  const containerRef = useRef(null);

  // Using useGSAP to animate the container on mount
  useGSAP(() => {
    gsap.from(containerRef.current, { duration: 1, opacity: 0, y: -50 });
  }, { scope: containerRef });

  React.useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!localPrefs) return;
    setIsSaving(true);
    try {
      await savePreferences(localPrefs);
      navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (!localPrefs) return null;

  return (
    <View ref={containerRef} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <IconButton
            icon="arrow-left"
            onPress={() => navigation.goBack()}
          />
          <Text variant="headlineMedium">Preferences</Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Display
          </Text>
          <View style={styles.row}>
            <Text>Dark Mode</Text>
            <Switch
              value={localPrefs.dark_mode}
              onValueChange={(v: boolean) =>
                setLocalPrefs({ ...localPrefs, dark_mode: v })
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Notifications
          </Text>
          <View style={styles.row}>
            <Text>Email Notifications</Text>
            <Switch
              value={localPrefs.email_notifications}
              onValueChange={(v: boolean) =>
                setLocalPrefs({ ...localPrefs, email_notifications: v })
              }
            />
          </View>
          <View style={styles.row}>
            <Text>In-App Notifications</Text>
            <Switch
              value={localPrefs.in_app_notifications}
              onValueChange={(v: boolean) =>
                setLocalPrefs({ ...localPrefs, in_app_notifications: v })
              }
            />
          </View>

          <Text style={styles.subHeader}>Notification Types</Text>
          {['reminders', 'messages', 'appointments', 'updates'].map((type) => (
            <NotificationPreferenceItem
              key={type}
              label={type}
              isEnabled={!(localPrefs.disabled_notification_types ?? []).includes(type)}
              onToggle={() => {
                const currentTypes = localPrefs.disabled_notification_types ?? [];
                const updatedTypes = currentTypes.includes(type)
                  ? currentTypes.filter(t => t !== type)
                  : [...currentTypes, type];
                setLocalPrefs({ ...localPrefs, disabled_notification_types: updatedTypes });
              }}
            />
          ))}
        </View>

        <Button 
          mode="contained" 
          onPress={handleSave}
          loading={isSaving}
          style={styles.saveButton}
        >
          Save Preferences
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 16
  },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  subHeader: { 
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500'
  },
  saveButton: { marginTop: 24 }
});