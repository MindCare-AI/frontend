import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Chip, RadioButton } from 'react-native-paper';
import { SectionHeader } from './SectionHeader';
import { globalStyles } from '../../styles/global';
import { AppSettings } from '../../API/settings/settings';

interface AppearanceSettingsProps {
  initialData: Partial<AppSettings>;
  onUpdate: (data: Partial<AppSettings>) => void;
  loading?: boolean;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  initialData,
  onUpdate,
  loading = false,
}) => {
  const [settings, setSettings] = useState<Partial<AppSettings>>(initialData);

  useEffect(() => {
    setSettings(initialData);
  }, [initialData]);

  const handleChange = <K extends keyof AppSettings>(field: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [field]: value };
      onUpdate(updated);
      return updated;
    });
  };

  const themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  const fontSizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
  ];

  return (
    <View style={styles.container}>
      <SectionHeader 
        title="Theme" 
        description="Choose your preferred app theme" 
      />
      
      <RadioButton.Group
        value={settings.theme || 'system'}
        onValueChange={value => handleChange('theme', value)}
      >
        <View style={styles.radioGroup}>
          {themeOptions.map((option) => (
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
        title="Font Size" 
        description="Adjust the text size throughout the app" 
      />
      
      <View style={styles.chipGroup}>
        {fontSizeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleChange('fontSize', option.value)}
            disabled={loading}
          >
            <Chip
              selected={settings.fontSize === option.value}
              style={[
                styles.chip,
                settings.fontSize === option.value && styles.selectedChip
              ]}
              mode="flat"
              disabled={loading}
            >
              {option.label}
            </Chip>
          </TouchableOpacity>
        ))}
      </View>
      
      <SectionHeader 
        title="Media Settings" 
        description="Control how media content behaves" 
      />
      
      <TouchableOpacity
        style={styles.toggleOption}
        onPress={() => handleChange('autoPlayMedia', !(settings.autoPlayMedia ?? true))}
        disabled={loading}
      >
        <Text style={styles.toggleLabel}>Auto-play media</Text>
        <View style={[
          styles.toggleTrack, 
          (settings.autoPlayMedia ?? true) && styles.toggleActive,
          loading && styles.toggleDisabled
        ]}>
          <View style={[
            styles.toggleThumb,
            (settings.autoPlayMedia ?? true) && styles.toggleThumbActive
          ]} />
        </View>
      </TouchableOpacity>

      <SectionHeader 
        title="Data Usage" 
        description="Control how the app uses your data" 
      />

      <TouchableOpacity
        style={styles.toggleOption}
        onPress={() => handleChange('dataUsage', {
          ...(settings.dataUsage || {}),
          wifiOnly: !(settings.dataUsage?.wifiOnly ?? false)
        })}
        disabled={loading}
      >
        <Text style={styles.toggleLabel}>Download media on Wi-Fi only</Text>
        <View style={[
          styles.toggleTrack, 
          (settings.dataUsage?.wifiOnly ?? false) && styles.toggleActive,
          loading && styles.toggleDisabled
        ]}>
          <View style={[
            styles.toggleThumb,
            (settings.dataUsage?.wifiOnly ?? false) && styles.toggleThumbActive
          ]} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.toggleOption}
        onPress={() => handleChange('dataUsage', {
          ...(settings.dataUsage || {}),
          autoDownload: !(settings.dataUsage?.autoDownload ?? true)
        })}
        disabled={loading}
      >
        <Text style={styles.toggleLabel}>Auto-download media</Text>
        <View style={[
          styles.toggleTrack, 
          (settings.dataUsage?.autoDownload ?? true) && styles.toggleActive,
          loading && styles.toggleDisabled
        ]}>
          <View style={[
            styles.toggleThumb,
            (settings.dataUsage?.autoDownload ?? true) && styles.toggleThumbActive
          ]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
    backgroundColor: globalStyles.colors.neutralLightest,
  },
  selectedChip: {
    backgroundColor: globalStyles.colors.primaryLight,
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: globalStyles.colors.neutralLightest,
  },
  toggleLabel: {
    fontSize: 16,
  },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: globalStyles.colors.neutralLight,
    padding: 3,
  },
  toggleActive: {
    backgroundColor: globalStyles.colors.primaryLight,
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: globalStyles.colors.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
});