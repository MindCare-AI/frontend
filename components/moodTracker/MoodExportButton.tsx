// components/moodTracker/MoodExportButton.tsx
import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { useMood } from '../../contexts/moodContext';
import { MoodFilters } from '../../types/Mood';

interface MoodExportButtonProps {
  filters?: MoodFilters;
  buttonStyle?: object;
  textStyle?: object;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const MoodExportButton: React.FC<MoodExportButtonProps> = ({
  filters,
  buttonStyle,
  textStyle,
  onSuccess,
  onError
}) => {
  const { exportMoodData } = useMood();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsExporting(true);
    
    try {
      await exportMoodData(filters);
      
      if (Platform.OS !== 'web') {
        // For native platforms, we need to save the file and share it
        // Note: This is a placeholder as actual file download handling differs by platform
        Alert.alert(
          'Export Success',
          'Your mood data has been exported successfully.',
          [{ text: 'OK', onPress: () => onSuccess && onSuccess() }]
        );
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export mood data';
      
      if (Platform.OS !== 'web') {
        Alert.alert('Export Failed', errorMessage);
      }
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, buttonStyle, isExporting && styles.disabledButton]} 
      onPress={handleExport}
      disabled={isExporting}
      activeOpacity={0.8}
    >
      {isExporting ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Feather name="download" size={16} color="#fff" style={styles.icon} />
          <Text style={[styles.text, textStyle]}>Export Data</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#002D62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        cursor: 'pointer',
      },
    }),
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MoodExportButton;