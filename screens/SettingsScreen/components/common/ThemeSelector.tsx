//screens/SettingsScreen/components/common/ThemeSelector.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colorSchemes } from '../../constants';
import { Animated } from 'react-native';

interface ThemeSelectorProps {
  currentMode: string;
  currentColor: string;
  onSelectMode: (mode: string) => void;
  onSelectColor: (color: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentMode,
  currentColor,
  onSelectMode,
  onSelectColor,
}) => {
  const modes = [
    { label: 'System Default', value: 'system', icon: '🌓' },
    { label: 'Light', value: 'light', icon: '☀️' },
    { label: 'Dark', value: 'dark', icon: '🌙' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Theme Mode</Text>
      <View style={styles.optionsContainer}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.value}
            style={[
              styles.optionButton,
              currentMode === mode.value && styles.selectedOption,
            ]}
            onPress={() => onSelectMode(mode.value)}
          >
            <Text style={styles.modeIcon}>{mode.icon}</Text>
            <Text
              style={[
                styles.optionText,
                currentMode === mode.value && styles.selectedOptionText,
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.header, { marginTop: 24 }]}>Color Scheme</Text>
      <View style={styles.optionsContainer}>
        {colorSchemes.map((scheme) => (
          <TouchableOpacity
            key={scheme.value}
            style={[
              styles.colorButton,
              currentColor === scheme.value && styles.selectedColorButton,
            ]}
            onPress={() => onSelectColor(scheme.value)}
          >
            <View 
              style={[
                styles.colorPreview, 
                { backgroundColor: scheme.value.toLowerCase() }
              ]} 
            />
            <Text
              style={[
                styles.optionText,
                currentColor === scheme.value && styles.selectedOptionText,
              ]}
            >
              {scheme.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#002D62',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minWidth: '45%',
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: '#002D62',
    backgroundColor: '#E4F0F6',
  },
  modeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  optionText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#002D62',
    fontWeight: '600',
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minWidth: '45%',
    marginBottom: 8,
  },
  selectedColorButton: {
    borderColor: '#002D62',
    backgroundColor: '#E4F0F6',
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});