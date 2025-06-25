import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/global';

interface SettingToggleProps {
  label: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  description?: string;
}

export const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  value,
  onToggle,
  disabled = false,
  description,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      disabled={disabled}
    >
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <View
        style={[
          styles.toggleTrack,
          value && styles.toggleActive,
          disabled && styles.toggleDisabled,
        ]}
      >
        <View
          style={[
            styles.toggleThumb,
            value && styles.toggleThumbActive,
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: globalStyles.colors.border,
    backgroundColor: globalStyles.colors.white,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
  },
  labelContainer: {
    flex: 1,
    paddingRight: 8,
  },
  label: {
    fontSize: 16,
    color: globalStyles.colors.text,
  },
  description: {
    fontSize: 12,
    color: globalStyles.colors.textSecondary,
    marginTop: 2,
  },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    padding: 3,
  },
  toggleActive: {
    backgroundColor: globalStyles.colors.primary,
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