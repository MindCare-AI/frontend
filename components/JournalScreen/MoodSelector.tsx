import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mood } from '../../types/journal';

const moodEmojis: Record<Mood, string> = {
  very_negative: '😭',
  negative: '😔',
  neutral: '😐',
  positive: '🙂',
  very_positive: '😄',
};

const moodLabels: Record<Mood, string> = {
  very_negative: 'Very Negative',
  negative: 'Negative',
  neutral: 'Neutral',
  positive: 'Positive',
  very_positive: 'Very Positive',
};

const moodColors: Record<Mood, string> = {
  very_negative: '#E53935',
  negative: '#FB8C00',
  neutral: '#9E9E9E',
  positive: '#8BC34A',
  very_positive: '#43A047',
};

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
  label?: string;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  label = 'How are you feeling today?'
}) => {
  const moods: Mood[] = ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'];
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[
              styles.moodItem,
              { borderColor: moodColors[mood] },
              selectedMood === mood && { backgroundColor: moodColors[mood] }
            ]}
            onPress={() => onMoodSelect(mood)}
          >
            <Text style={styles.moodEmoji}>{moodEmojis[mood]}</Text>
            <Text style={[
              styles.moodLabel,
              selectedMood === mood && styles.selectedMoodLabel
            ]}>
              {moodLabels[mood]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  moodItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    width: '18%',
    marginBottom: 10,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  moodLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  selectedMoodLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MoodSelector;