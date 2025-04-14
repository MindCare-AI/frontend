//screens/SettingsScreen/UserPreferencesScreen.tsx
import React, { useRef } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Switch, ActivityIndicator, Appbar } from 'react-native-paper';
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
  const [hasChanges, setHasChanges] = React.useState<boolean>(false);

  // Create refs for GSAP animations
  const containerRef = useRef(null);
  const formRef = useRef(null);

  // Using useGSAP to animate the container on mount
  useGSAP(() => {
    gsap.from(containerRef.current, { 
      duration: 0.5, 
      opacity: 0, 
      y: -20,
      ease: "power2.out" 
    });
  }, { scope: containerRef });

  React.useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  // Check for unsaved changes
  React.useEffect(() => {
    if (preferences && localPrefs) {
      setHasChanges(JSON.stringify(preferences) !== JSON.stringify(localPrefs));
    }
  }, [preferences, localPrefs]);

  // Handle navigation prevention when there are unsaved changes
  React.useEffect(() => {
    const handleBeforeRemove = (e: any) => {
      if (!hasChanges) return;
      
      e.preventDefault();
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to discard them?',
        [
          { text: "Keep Editing", style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    };

    navigation.addListener('beforeRemove', handleBeforeRemove);
    return () => navigation.removeListener('beforeRemove', handleBeforeRemove);
  }, [hasChanges, navigation]);

  const handleSave = async () => {
    if (!localPrefs) return;
    setIsSaving(true);
    try {
      await savePreferences(localPrefs);
      gsap.to(formRef.current, {
        scale: 1.02,
        duration: 0.2,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
      });
      setHasChanges(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002D62" />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  if (!localPrefs) return null;

  return (
    <View ref={containerRef} style={styles.mainContainer}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Preferences" />
        {hasChanges && (
          <Appbar.Action 
            icon="check" 
            onPress={handleSave} 
            disabled={isSaving}
          />
        )}
      </Appbar.Header>

      <ScrollView 
        ref={formRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Theme Settings
          </Text>
          <View style={styles.row}>
            <Text>Dark Mode</Text>
            <Switch
              value={localPrefs.dark_mode}
              onValueChange={v => setLocalPrefs({ ...localPrefs, dark_mode: v })}
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
              onValueChange={v => 
                setLocalPrefs({ ...localPrefs, email_notifications: v })
              }
            />
          </View>
          <View style={styles.row}>
            <Text>In-App Notifications</Text>
            <Switch
              value={localPrefs.in_app_notifications}
              onValueChange={v => 
                setLocalPrefs({ ...localPrefs, in_app_notifications: v })
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Notification Types
          </Text>
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

        {hasChanges && (
          <Button 
            mode="contained" 
            onPress={handleSave}
            loading={isSaving}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    elevation: 0,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});