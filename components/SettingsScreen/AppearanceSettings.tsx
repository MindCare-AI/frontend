import React, { useEffect } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Text, RadioButton } from 'react-native-paper';
import { SectionHeader } from './SectionHeader';
import { globalStyles } from '../../styles/global';
import { AppSettings, ThemePreferences, PrivacySettings } from '../../API/settings/settings';

interface AppearanceSettingsProps {
  initialData: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
  loading?: boolean;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  initialData,
  onUpdate,
  loading = false,
}) => {
  // Removed unused state and handleChange function

  const visibilityOptions = [
    { label: 'Public', value: 'PUBLIC' },
    { label: 'Private', value: 'PRIVATE' },
    { label: 'Contacts Only', value: 'CONTACTS_ONLY' },
  ];

  const themeOptions = [
    { label: 'Light Theme', value: 'LIGHT' },
    { label: 'Dark Theme', value: 'DARK' },
    { label: 'Use System Default', value: 'SYSTEM' },
  ];

  const colorSchemeOptions = [
    { label: 'Blue', value: 'blue' },
    { label: 'Green', value: 'green' },
    { label: 'Purple', value: 'purple' },
    { label: 'Orange', value: 'orange' },
  ];

  // Get current values or use defaults
  const currentTheme = initialData.theme_preferences?.mode || 'SYSTEM';
  const currentColorScheme = initialData.theme_preferences?.color_scheme || 'blue';
  const currentVisibility = initialData.privacy_settings?.profile_visibility || 'PUBLIC';
  const showOnlineStatus = initialData.privacy_settings?.show_online_status ?? false;

  const handleThemeChange = (mode: string) => {
    const updatedThemePrefs: ThemePreferences = {
      mode: mode as ThemePreferences['mode'],
      color_scheme: currentColorScheme,
    };
    onUpdate({ theme_preferences: updatedThemePrefs });
  };

  const handleColorSchemeChange = (colorScheme: string) => {
    const updatedThemePrefs: ThemePreferences = {
      mode: currentTheme as ThemePreferences['mode'],
      color_scheme: colorScheme,
    };
    onUpdate({ theme_preferences: updatedThemePrefs });
  };

  const handleVisibilityChange = (visibility: string) => {
    const updatedPrivacy: PrivacySettings = {
      profile_visibility: visibility as PrivacySettings['profile_visibility'],
      show_online_status: showOnlineStatus,
    };
    onUpdate({ privacy_settings: updatedPrivacy });
  };

  const handleOnlineStatusChange = (value: boolean) => {
    const updatedPrivacy: PrivacySettings = {
      profile_visibility: currentVisibility as PrivacySettings['profile_visibility'],
      show_online_status: value,
    };
    onUpdate({ privacy_settings: updatedPrivacy });
  };

  return (
    <View style={styles.container}> 
      <SectionHeader 
        title="Theme" 
        description="Choose your preferred app theme" 
      />
      
      <RadioButton.Group 
        onValueChange={(value) => handleThemeChange(value)} 
        value={currentTheme}
      >
        {themeOptions.map((option) => (
          <View key={option.value} style={styles.option}>
            <RadioButton.Item
              label={option.label}
              value={option.value}
              disabled={loading}
              status={currentTheme === option.value ? 'checked' : 'unchecked'}
              color={globalStyles.colors.primary}
              uncheckedColor={globalStyles.colors.neutralMedium}
              labelStyle={styles.radioLabel}
            />
          </View>
        ))}
      </RadioButton.Group>
      
      <SectionHeader 
        title="Color Scheme" 
        description="Choose your preferred color accent" 
      />
      
      <RadioButton.Group 
        onValueChange={(value) => handleColorSchemeChange(value)} 
        value={currentColorScheme}
      >
        {colorSchemeOptions.map((option) => (
          <View key={option.value} style={styles.option}>
            <RadioButton.Item
              label={option.label}
              value={option.value}
              disabled={loading}
              status={currentColorScheme === option.value ? 'checked' : 'unchecked'}
              color={globalStyles.colors.primary}
              uncheckedColor={globalStyles.colors.neutralMedium}
              labelStyle={styles.radioLabel}
            />
          </View>
        ))}
      </RadioButton.Group>
      
      <SectionHeader 
        title="Profile Visibility" 
        description="Control who can see your profile" 
      />
      
      <RadioButton.Group
        value={currentVisibility}
        onValueChange={(value) => handleVisibilityChange(value)}
      >
        <View style={styles.radioGroup}>
          {visibilityOptions.map((option) => (
            <View key={option.value} style={styles.radioItem}>
              <RadioButton.Android 
                value={option.value} 
                disabled={loading}
                color={globalStyles.colors.primary}
              />
              <Text style={styles.radioLabel}>{option.label}</Text>
            </View>
          ))}
        </View>
      </RadioButton.Group>
      
      <SectionHeader 
        title="Online Status" 
        description="Control whether others can see when you're online" 
      />
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Show when I'm online</Text>
        <Switch
          value={showOnlineStatus}
          onValueChange={handleOnlineStatusChange}
          disabled={loading}
          trackColor={{ 
            false: globalStyles.colors.neutralMedium, 
            true: globalStyles.colors.primaryLight 
          }}
          thumbColor={showOnlineStatus ? globalStyles.colors.primary : globalStyles.colors.white}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  option: {
    marginBottom: 8,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: globalStyles.colors.text,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: globalStyles.colors.text,
  }
});