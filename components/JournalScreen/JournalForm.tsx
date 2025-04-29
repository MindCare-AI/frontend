import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Switch, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { JournalEntry, Mood, Weather } from '../../types/journal';
import MoodSelector from './MoodSelector';
import WeatherSelector from './WeatherSelector';
import ActivitySelector from './ActivitySelector';
import { getCurrentDate } from '../../utils/dateUtils';

interface JournalFormProps {
  initialEntry?: Partial<JournalEntry>;
  onSubmit: (entry: Partial<JournalEntry>) => Promise<void>;
  isSubmitting?: boolean;
  buttonText?: string;
}

const JournalForm: React.FC<JournalFormProps> = ({
  initialEntry,
  onSubmit,
  isSubmitting = false,
  buttonText = 'Save'
}) => {
  const [title, setTitle] = useState<string>(initialEntry?.title || '');
  const [content, setContent] = useState<string>(initialEntry?.content || '');
  const [mood, setMood] = useState<Mood | null>(initialEntry?.mood || null);
  const [weather, setWeather] = useState<Weather | null>(initialEntry?.weather || null);
  const [activities, setActivities] = useState<string[]>(initialEntry?.activities ? initialEntry.activities.split(',') : []);
  const [isPrivate, setIsPrivate] = useState<boolean>(initialEntry?.is_private !== undefined ? initialEntry.is_private : true);
  const [shareWithTherapist, setShareWithTherapist] = useState<boolean>(
    initialEntry?.shared_with_therapist || false
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when initialEntry changes
    if (initialEntry) {
      setTitle(initialEntry.title || '');
      setContent(initialEntry.content || '');
      setMood(initialEntry.mood || null);
      setWeather(initialEntry.weather || null);
      setActivities(initialEntry.activities ? initialEntry.activities.split(',') : []);
      setIsPrivate(initialEntry.is_private !== undefined ? initialEntry.is_private : true);
      setShareWithTherapist(initialEntry.shared_with_therapist || false);
    }
  }, [initialEntry]);

  const handleSubmit = async () => {
    setFormError(null);

    // Form validation
    if (!title.trim()) {
      setFormError('Please enter a title');
      return;
    }

    if (!content.trim()) {
      setFormError('Please enter some content for your journal');
      return;
    }

    if (!mood) {
      setFormError('Please select a mood');
      return;
    }

    const entry: Partial<JournalEntry> = {
      ...initialEntry,
      title: title.trim(),
      content: content.trim(),
      mood,
      weather: weather || 'sunny',
      activities: activities.join(','),
      is_private: isPrivate,
      shared_with_therapist: shareWithTherapist,
      date: initialEntry?.date || getCurrentDate()
    };

    try {
      await onSubmit(entry);
    } catch (error) {
      console.error('Error submitting journal entry:', error);
      setFormError('Failed to save journal entry. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.titleInput}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />

      <TextInput
        style={styles.contentInput}
        placeholder="What's on your mind today?"
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      <MoodSelector
        selectedMood={mood}
        onMoodSelect={setMood}
      />

      <WeatherSelector
        selectedWeather={weather}
        onWeatherSelect={setWeather}
      />

      <ActivitySelector
        selectedActivities={activities}
        onActivityChange={setActivities}
      />

      <View style={styles.switchContainer}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Keep Private</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isPrivate ? '#1976d2' : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Share with Therapist</Text>
          <Switch
            value={shareWithTherapist}
            onValueChange={setShareWithTherapist}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={shareWithTherapist ? '#1976d2' : '#f4f3f4'}
            disabled={initialEntry?.shared_with_therapist}
          />
        </View>
      </View>

      {formError && <Text style={styles.errorText}>{formError}</Text>}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>{buttonText}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minHeight: 150,
    marginBottom: 16,
    lineHeight: 22,
  },
  switchContainer: {
    marginVertical: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginVertical: 8,
    textAlign: 'center',
  },
});

export default JournalForm;