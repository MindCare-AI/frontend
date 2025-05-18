// screens/moodTracker/LogMoodScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import MoodForm from '../../components/moodTracker/MoodForm';
import { useMoodLogs } from '../../hooks/moodTracker/useMoodLogs';
import { MoodFormData, MoodLog } from '../../types/Mood';

interface RouteParams {
  moodId?: number;
  initialValues?: Partial<MoodFormData>;
}

const LogMoodScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { moodId, initialValues } = (route.params as RouteParams) || {};
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    logs,
    selectedLog,
    isLoading,
    error,
    createLog,
    updateLog,
    fetchLogById
  } = useMoodLogs();

  // Fetch mood log if editing
  React.useEffect(() => {
    if (moodId) {
      fetchLogById(moodId);
    }
  }, [moodId, fetchLogById]);

  const handleSubmit = useCallback(async (data: MoodFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (moodId && selectedLog) {
        // Update existing log
        const updatedLog = await updateLog(moodId, data);
        if (updatedLog) {
          navigation.goBack();
        }
      } else {
        // Create new log
        const newLog = await createLog(data);
        if (newLog) {
          if (Platform.OS === 'web') {
            alert('Mood logged successfully!');
          } else {
            Alert.alert(
              'Success',
              'Your mood has been recorded successfully.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save mood';
      if (Platform.OS === 'web') {
        alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [createLog, updateLog, moodId, selectedLog, navigation, isSubmitting]);

  // Determine form initial values
  const formInitialValues = moodId && selectedLog
    ? {
        mood_rating: selectedLog.mood_rating,
        energy_level: selectedLog.energy_level,
        activities: selectedLog.activities || ''
      }
    : initialValues || undefined;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {moodId ? 'Edit Mood' : 'Log Your Mood'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (moodId) {
                fetchLogById(moodId);
              }
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <MoodForm
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
          isLoading={isLoading || isSubmitting}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#002D62',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default LogMoodScreen;