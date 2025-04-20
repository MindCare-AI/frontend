//screens/SettingsScreen/UserSettingsScreen.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { ThemeSelector } from './components/common/ThemeSelector';
import { PrivacySettings } from './components/common/PrivacySettings';import { TimeZoneSelector } from './components/common/TimeZoneSelector';
import { timezones } from './constants';
import { useSettings } from './hooks/common/useSettings';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SettingsStackParamList } from '../../types/navigation';
import { globalStyles } from '../../styles/global';
import { Separator } from '../../components/common/Separator';

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

  const fadeIn = useRef(gsap.timeline({ paused: true }));
  const buttonPress = useRef(gsap.timeline({ paused: true }));

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
    buttonPress.current.to(buttonRef.current, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 }).play();
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
      fadeIn.current.to(formRef.current, { y: -5, duration: 0.2, yoyo: true, repeat: 1 }).play();
      navigation.goBack();
    } catch (err) {
      console.error('Error saving settings:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [localSettings, saveSettings, navigation]);

  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={globalStyles.loading}><ActivityIndicator animating={true} color={globalStyles.colors.primary} size="large" /></View>
        </View>
        <Text style={{ ...globalStyles.body, marginTop: globalStyles.spacing.md, color: globalStyles.colors.neutralMedium }}>
          Loading settings...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={globalStyles.errorText}>{error}</Text>
        <TouchableOpacity style={{ ...globalStyles.button, marginTop: globalStyles.spacing.md }} onPress={handleSave}>
          <Text style={globalStyles.button.text}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: globalStyles.colors.white }}>
      <View ref={containerRef} style={globalStyles.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: globalStyles.spacing.md }}>
          <View ref={formRef}>
            <ThemeSelector
              currentMode={localSettings?.theme_preferences?.mode ?? 'system'}
              currentColor={localSettings?.theme_preferences?.color_scheme ?? 'blue'}
              onSelectMode={(mode: string) => setLocalSettings(prev => prev ? {
                ...prev,
                theme_preferences: {
                  ...(prev.theme_preferences || {}),
                  mode: mode as ThemeMode
                }
              } : null)}
              onSelectColor={(color: string) => setLocalSettings(prev => prev ? {
                ...prev,
                theme_preferences: {
                  ...(prev.theme_preferences || {}),
                  color_scheme: color
                }
              } : null)}
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
              onOnlineStatusChange={(value: boolean) => setLocalSettings(prev => prev ? {
                ...prev,
                privacy_settings: {
                  ...(prev.privacy_settings || {}),
                  show_online_status: value
                }
              } : null)}
            />
            <Separator style={{ marginVertical: globalStyles.spacing.md }} />
            <TimeZoneSelector
              currentTimezone={localSettings?.timezone ?? ''}
              onTimezoneChange={(timezone: string) => setLocalSettings(prev => prev ? { ...prev, timezone } : null)}
            />
          </View>
          <TouchableOpacity
            ref={buttonRef}
            onPress={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            style={{ ...globalStyles.button, marginTop: globalStyles.spacing.md, backgroundColor: isSaving || !hasUnsavedChanges ? globalStyles.colors.disabled : globalStyles.colors.primary }}><Text style={globalStyles.button.text}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
            Save Changes
          </Button>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};


