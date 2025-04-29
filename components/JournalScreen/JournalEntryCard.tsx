import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { JournalEntry, Mood, Weather } from '../../types/journal';
import { getTimeAgo, formatDate } from '../../utils/dateUtils';

// Mood emojis for display
const moodEmojis: Record<Mood, string> = {
  very_negative: '😭',
  negative: '😔',
  neutral: '😐', 
  positive: '🙂',
  very_positive: '😄',
};

// Weather icons for display
const weatherIcons: Record<Weather, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
};

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: (entry: JournalEntry) => void;
  compact?: boolean;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ 
  entry, 
  onPress,
  compact = false 
}) => {
  const {
    title,
    content,
    mood,
    date,
    created_at,
    shared_with_therapist,
    weather,
    word_count
  } = entry;

  // Preview text with character limit
  const previewText = content.length > 100 
    ? `${content.substring(0, 100)}...` 
    : content;

  return (
    <TouchableOpacity 
      style={[styles.card, compact && styles.compactCard]} 
      onPress={() => onPress(entry)}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.moodContainer}>
            <Text style={styles.moodEmoji}>{moodEmojis[mood]}</Text>
            {weather && <Text style={styles.weatherIcon}>{weatherIcons[weather]}</Text>}
          </View>
        </View>
        
        <Text style={styles.date}>
          {compact ? getTimeAgo(created_at) : formatDate(date)}
        </Text>
      </View>

      {!compact && (
        <Text style={styles.preview} numberOfLines={2}>
          {previewText}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.wordCount}>{word_count} words</Text>
        
        {shared_with_therapist && (
          <View style={styles.sharedBadge}>
            <Text style={styles.sharedText}>Shared</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactCard: {
    padding: 12,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  moodContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  moodEmoji: {
    fontSize: 18,
  },
  weatherIcon: {
    fontSize: 18,
    marginLeft: 6,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  preview: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCount: {
    fontSize: 12,
    color: '#666',
  },
  sharedBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sharedText: {
    fontSize: 12,
    color: '#1976d2',
  },
});

export default JournalEntryCard;