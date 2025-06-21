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
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: globalStyles.colors.white,
    borderRadius: 12,
    shadowColor: globalStyles.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  labelContainer: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: globalStyles.colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: globalStyles.colors.textSecondary,
    lineHeight: 18,
  },
  toggleTrack: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: globalStyles.colors.neutralLight,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: globalStyles.colors.primary,
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: globalStyles.colors.white,
    shadowColor: globalStyles.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
});