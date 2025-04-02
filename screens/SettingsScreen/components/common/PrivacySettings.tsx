//screens/SettingsScreen/components/common/PrivacySettings.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

interface PrivacySettingsProps {
  profileVisibility: string;
  showOnlineStatus: boolean;
  onProfileVisibilityChange: (value: string) => void;
  onOnlineStatusChange: (value: boolean) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  profileVisibility,
  showOnlineStatus,
  onProfileVisibilityChange,
  onOnlineStatusChange,
}) => {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Privacy Settings
      </Text>

      <View style={styles.settingRow}>
        <Text style={styles.label}>Profile Visibility</Text>
        <Picker
          selectedValue={profileVisibility}
          style={styles.picker}
          onValueChange={onProfileVisibilityChange}>
          <Picker.Item label="Public" value="public" />
          <Picker.Item label="Friends Only" value="friends_only" />
          <Picker.Item label="Private" value="private" />
        </Picker>
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.label}>Show Online Status</Text>
        <Switch
          value={showOnlineStatus}
          onValueChange={onOnlineStatusChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  picker: {
    flex: 1,
    marginLeft: 12,
  },
});