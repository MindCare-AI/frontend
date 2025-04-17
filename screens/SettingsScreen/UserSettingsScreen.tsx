//screens/SettingsScreen/UserSettingsScreen.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { ThemeSelector } from './components/common/ThemeSelector';
import { PrivacySettings } from './components/common/PrivacySettings';
import { timezones } from './constants';
import { useSettings } from './hooks/common/useSettings';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
}

interface APISettings {
  id?: number;
  timezone: string;
  theme_preferences: {
    mode?: APIThemeMode;
    color_scheme?: string;
  };
  privacy_settings: {
    profile_visibility?: APIProfileVisibility;
    show_online_status?: boolean;
  };
}

export const UserSettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { settings, loading, error, saveSettings } = useSettings();
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
          mode: (settings.theme_preferences?.mode?.toLowerCase() || 'system') as ThemeMode,
          color_scheme: settings.theme_preferences?.color_scheme || 'blue'
        },
        privacy_settings: {
          profile_visibility: (settings.privacy_settings?.profile_visibility?.toLowerCase() || 'public') as ProfileVisibility,
          show_online_status: Boolean(settings.privacy_settings?.show_online_status),
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
      e.preventDefault();
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: "Don't leave", style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setAllowDiscard(true);
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
        theme_preferences: {
          mode: localSettings.theme_preferences?.mode?.toUpperCase() as APIThemeMode,
          color_scheme: localSettings.theme_preferences?.color_scheme || 'blue'
        },
        privacy_settings: {
          profile_visibility: localSettings.privacy_settings?.profile_visibility?.toUpperCase() as APIProfileVisibility,
          show_online_status: localSettings.privacy_settings?.show_online_status === true
        }
      };
      await saveSettings(apiSettings as any); // Cast if Partial<Settings> has incompatible types
      gsap.to(formRef.current, { y: -5, duration: 0.2, yoyo: true, repeat: 1 });
      navigation.goBack();
    } catch (err) {
      console.error('Error saving settings:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [localSettings, saveSettings, navigation]);

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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading settings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#D32F2F', fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View ref={containerRef} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View ref={formRef}>
            <ThemeSelector
              currentMode={localSettings?.theme_preferences?.mode ?? 'system'}
              currentColor={localSettings?.theme_preferences?.color_scheme ?? 'blue'}
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
            <View style={{ marginTop: 16 }}>
              <Text style={styles.sectionTitle}>Timezone</Text>
              <View style={styles.card}>
                <ScrollView horizontal>
                  <View>
                    <Text style={{ marginBottom: 8 }}>Select your timezone:</Text>
                    <ScrollView style={{ maxHeight: 120 }}>
                      {timezones.map((tz: any, index: number) => {
                        const tzValue = typeof tz === 'object' ? tz.value : tz;
                        return (
                          <Button
                            key={tzValue || index}  // Use tz.value if available, otherwise fallback to index
                            mode={localSettings?.timezone === String(tzValue) ? 'contained' : 'outlined'}
                            onPress={() =>
                              setLocalSettings((prev) =>
                                prev ? { ...prev, timezone: String(tzValue) } : null
                              )
                            }
                            style={{ marginVertical: 2 }}
                          >
                            {String(tzValue)}
                          </Button>
                        );
                      })}
                    </ScrollView>
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
          <Button
            ref={buttonRef}
            onPress={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            style={styles.saveButton}
            labelStyle={styles.saveButtonText}
            loading={isSaving}
          >
            Save Changes
          </Button>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default UserSettingsScreen;
