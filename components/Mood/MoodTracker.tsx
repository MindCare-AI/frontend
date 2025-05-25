import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
} from 'react-native';
import { colors, spacing, fontSizes, shadows, borderRadius } from '../Journal/theme';

interface MoodTrackerProps {
  onMoodLogged: (moodLog: any) => void;
}

const moodOptions = [
  { key: 'very_happy', label: 'Very Happy', emoji: '😄', color: '#4CAF50' },
  { key: 'happy', label: 'Happy', emoji: '😊', color: '#8BC34A' },
  { key: 'neutral', label: 'Neutral', emoji: '😐', color: '#FFC107' },
  { key: 'sad', label: 'Sad', emoji: '😢', color: '#FF9800' },
  { key: 'very_sad', label: 'Very Sad', emoji: '😭', color: '#F44336' },
  { key: 'anxious', label: 'Anxious', emoji: '😰', color: '#9C27B0' },
  { key: 'calm', label: 'Calm', emoji: '😌', color: '#2196F3' },
  { key: 'excited', label: 'Excited', emoji: '🤩', color: '#FF5722' },
];

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodLogged }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  const handleMoodSelect = (moodKey: string) => {
    setSelectedMood(moodKey);
    if (!isExpanded) {
      setIsExpanded(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heightAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handleSubmit = () => {
    if (selectedMood && rating > 0) {
      const newMoodLog = {
        id: Date.now(),
        mood: selectedMood,
        rating,
        note,
        timestamp: new Date().toISOString(),
      };
      
      onMoodLogged(newMoodLog);
      
      // Reset form
      setSelectedMood(null);
      setRating(0);
      setNote('');
      setIsExpanded(false);
      fadeAnim.setValue(0);
      heightAnim.setValue(0);
    }
  };

  return (
    <View style={[styles.container, shadows.md]}>
      <Text style={styles.title}>Track Your Mood</Text>
      <Text style={styles.subtitle}>How are you feeling right now?</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodOptions}
      >
        {moodOptions.map((mood) => (
          <TouchableOpacity
            key={mood.key}
            style={[
              styles.moodOption,
              selectedMood === mood.key && [
                styles.selectedMoodOption,
                { borderColor: mood.color, backgroundColor: `${mood.color}15` }
              ]
            ]}
            onPress={() => handleMoodSelect(mood.key)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[
              styles.moodLabel,
              selectedMood === mood.key && { color: mood.color }
            ]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Animated.View
        style={[
          styles.expandedSection,
          {
            opacity: fadeAnim,
            maxHeight: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200],
            }),
          },
        ]}
      >
        {/* Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionLabel}>Rate your mood (1-5):</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.ratingStar}
              >
                <Text style={[
                  styles.ratingStarText,
                  { opacity: star <= rating ? 1 : 0.3 }
                ]}>
                  ⭐
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteSection}>
          <Text style={styles.sectionLabel}>Add a note (optional):</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="What's on your mind?"
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
            placeholderTextColor={colors.gray}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedMood || rating === 0) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!selectedMood || rating === 0}
        >
          <Text style={styles.submitButtonText}>Save Mood</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  moodOptions: {
    paddingVertical: spacing.sm,
  },
  moodOption: {
    alignItems: 'center',
    padding: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.lightGray,
    backgroundColor: colors.background,
    minWidth: 80,
  },
  selectedMoodOption: {
    borderWidth: 2,
    ...shadows.sm,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  expandedSection: {
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  ratingSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ratingStar: {
    padding: spacing.xs,
  },
  ratingStarText: {
    fontSize: 32,
  },
  noteSection: {
    marginBottom: spacing.md,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
