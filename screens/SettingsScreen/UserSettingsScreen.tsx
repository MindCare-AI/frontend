//screens/SettingsScreen/UserSettingsScreen.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Modal, Alert, SafeAreaView } from 'react-native';
import { Button, Text, IconButton, Surface } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { ThemeSelector } from './components/common/ThemeSelector';
import { PrivacySettings } from './components/common/PrivacySettings';
import { timezones } from './constants';
import { useSettings } from './hooks/common/useSettings';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SettingsStackParamList } from '../../types/navigation';

const PRIMARY_COLOR = '#002D62';

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'UserSettings'>;

type ProfileVisibility = 'public' | 'contacts' | 'private';
type ThemeMode = 'light' | 'dark' | 'system';

type APIThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';
type APIProfileVisibility = 'PUBLIC' | 'CONTACTS' | 'PRIVATE';

interface UserSettings {
  id?: number;
  timezone: string;
  theme_preferences?: {
    mode?: ThemeMode;
    color_scheme?: string;
  };
  privacy_settings?: {
    profile_visibility?: ProfileVisibility;
    show_online_status?: boolean;
  };
  notification_preferences?: {
    email_notifications?: boolean;
    in_app_notifications?: boolean;
  };
}

interface APISettings {
  id?: number;
  timezone: string;
  theme_mode?: APIThemeMode;
  profile_visibility?: APIProfileVisibility;
  theme_preferences: Record<string, string>;
  privacy_settings: Record<string, string>;
}

export const UserSettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { settings, loading, error, saveSettings, refetch } = useSettings();
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [allowDiscard, setAllowDiscard] = useState(false);
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const buttonRef = useRef(null);

  useGSAP(() => {
    gsap.from(containerRef.current, { duration: 1, opacity: 0, y: -50 });
  }, { scope: containerRef });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        id: settings.id,
        timezone: settings.timezone,
        theme_preferences: {
          mode: (settings.theme_mode?.toLowerCase() || 'system') as ThemeMode,
          color_scheme: settings.theme_preferences?.color_scheme || 'blue'
        },
        privacy_settings: {
          profile_visibility: (settings.profile_visibility?.toLowerCase() || 'public') as ProfileVisibility,
          show_online_status: settings.privacy_settings?.show_online_status === 'true'
        },
        notification_preferences: {
          email_notifications: settings.privacy_settings?.email_notifications === 'true',
          in_app_notifications: settings.privacy_settings?.in_app_notifications === 'true'
        }
      });
    }
  }, [settings]);

  useEffect(() => {
    if (settings && localSettings) {
      setHasUnsavedChanges(JSON.stringify(settings) !== JSON.stringify(localSettings));
    }
  }, [settings, localSettings]);

  useEffect(() => {
    const beforeRemoveListener = navigation.addListener('beforeRemove', (e) => {
      if (allowDiscard || !hasUnsavedChanges) return;

      e.preventDefault(); // Block navigation by default

      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          {
            text: "Don't leave",
            style: 'cancel'
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setAllowDiscard(true);
              // Allow the navigation to proceed:
              navigation.dispatch(e.data.action);
            }
          },
        ]
      );
    });
    return beforeRemoveListener;
  }, [navigation, hasUnsavedChanges, allowDiscard]);

  const handleSave = useCallback(async () => {
    if (!localSettings) return;
    setIsSaving(true);
    gsap.to(buttonRef.current, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    try {
      const apiSettings: APISettings = {
        id: localSettings.id,
        timezone: localSettings.timezone,
        theme_mode: localSettings.theme_preferences?.mode?.toUpperCase() as APIThemeMode,
        profile_visibility: localSettings.privacy_settings?.profile_visibility?.toUpperCase() as APIProfileVisibility,
        theme_preferences: {
          color_scheme: localSettings.theme_preferences?.color_scheme || 'blue'
        },
        privacy_settings: {
          show_online_status: String(localSettings.privacy_settings?.show_online_status ?? true),
          email_notifications: String(localSettings.notification_preferences?.email_notifications ?? false),
          in_app_notifications: String(localSettings.notification_preferences?.in_app_notifications ?? false)
        }
      };
      await saveSettings(apiSettings);
      gsap.to(formRef.current, { y: -5, duration: 0.2, yoyo: true, repeat: 1 });
      navigation.goBack();
    } catch (err) {
      console.error('Error saving settings:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [localSettings, saveSettings, navigation]);

  // Style enhancements for user friendliness
  const styles = StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 16,
    },
    scrollContent: {
      padding: 16,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1A1A1A',
      marginBottom: 16,
    },
    divider: {
      height: 1,
      backgroundColor: '#E5E5E5',
      marginVertical: 16,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    optionText: {
      fontSize: 16,
      color: '#1A1A1A',
    },
    saveButton: {
      backgroundColor: '#002D62',
      marginHorizontal: 16,
      marginVertical: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View ref={containerRef} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View ref={formRef}>
            <ThemeSelector
              currentMode={localSettings?.theme_preferences?.mode ?? 'system'}
              currentColor={localSettings?.theme_preferences?.color_scheme ?? 'blue'}
              // Accepting a string and casting it to ThemeMode
              onSelectMode={(mode: string) =>
                setLocalSettings(prev =>
                  prev
                    ? {
                        ...prev,
                        theme_preferences: { ...(prev.theme_preferences || {}), mode: mode as ThemeMode }
                      }
                    : null
                )
              }
              onSelectColor={(color: string) =>
                setLocalSettings(prev =>
                  prev
                    ? {
                        ...prev,
                        theme_preferences: { ...(prev.theme_preferences || {}), color_scheme: color }
                      }
                    : null
                )
              }
            />
            <PrivacySettings
              profileVisibility={localSettings?.privacy_settings?.profile_visibility ?? 'public'}
              showOnlineStatus={localSettings?.privacy_settings?.show_online_status ?? true}
              // Accepting a string and casting it to ProfileVisibility
              onProfileVisibilityChange={(value: string) =>
                setLocalSettings(prev =>
                  prev
                    ? {
                        ...prev,
                        privacy_settings: { ...(prev.privacy_settings || {}), profile_visibility: value as ProfileVisibility }
                      }
                    : null
                )
              }
              onOnlineStatusChange={(value: boolean) =>
                setLocalSettings(prev =>
                  prev
                    ? {
                        ...prev,
                        privacy_settings: { ...(prev.privacy_settings || {}), show_online_status: value }
                      }
                    : null
                )
              }
            />
          </View>
          <Button ref={buttonRef} onPress={handleSave} disabled={isSaving}>Save Changes</Button>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default UserSettingsScreen;
