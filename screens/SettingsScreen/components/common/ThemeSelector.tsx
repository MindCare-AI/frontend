//screens/SettingsScreen/components/common/ThemeSelector.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colorSchemes } from '../../constants';

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
    { label: 'System Default', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
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

      <Text style={[styles.header, { marginTop: 16 }]}>Color Scheme</Text>
      <View style={styles.optionsContainer}>
        {colorSchemes.map((scheme) => (
          <TouchableOpacity
            key={scheme.value}
            style={[
              styles.optionButton,
              currentColor === scheme.value && styles.selectedOption,
            ]}
            onPress={() => onSelectColor(scheme.value)}
          >
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
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
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
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: '#3498db',
    backgroundColor: '#e6f0fa',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});