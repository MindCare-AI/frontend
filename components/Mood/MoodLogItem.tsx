import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors, spacing, fontSizes, shadows, borderRadius } from '../Journal/theme';

interface MoodLog {
  id: number;
  mood: string;
  rating: number;
  note: string;
  timestamp: string;
}

interface MoodLogItemProps {
  moodLog: MoodLog;
  index: number;
  style?: ViewStyle;
  onPress?: () => void;
}

const getMoodEmoji = (mood: string): string => {
  const moodEmojis: { [key: string]: string } = {
    'very_happy': '😄',
    'happy': '😊',
    'neutral': '😐',
    'sad': '😢',
    'very_sad': '😭',
    'angry': '😠',
    'anxious': '😰',
    'calm': '😌',
    'excited': '🤩',
    'tired': '😴',
  };
  return moodEmojis[mood] || '😊';
};

const getMoodColor = (mood: string): string => {
  const moodColors: { [key: string]: string } = {
    'very_happy': '#4CAF50',
    'happy': '#8BC34A',
    'neutral': '#FFC107',
    'sad': '#FF9800',
    'very_sad': '#F44336',
    'angry': '#E91E63',
    'anxious': '#9C27B0',
    'calm': '#2196F3',
    'excited': '#FF5722',
    'tired': '#607D8B',
  };
  return moodColors[mood] || colors.primary;
};

export const MoodLogItem: React.FC<MoodLogItemProps> = ({ 
  moodLog, 
  index, 
  style,
  onPress 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered animation
    const delay = index * 100;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  const moodColor = getMoodColor(moodLog.mood);
  const moodEmoji = getMoodEmoji(moodLog.mood);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.container, shadows.md]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Mood Indicator */}
        <View style={[styles.moodIndicator, { backgroundColor: moodColor }]}>
          <Text style={styles.moodEmoji}>{moodEmoji}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.moodText}>
              {moodLog.mood.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <Text
                  key={i}
                  style={[
                    styles.ratingStar,
                    { opacity: i < moodLog.rating ? 1 : 0.3 }
                  ]}
                >
                  ⭐
                </Text>
              ))}
            </View>
          </View>

          {moodLog.note && (
            <Text style={styles.note} numberOfLines={2}>
              {moodLog.note}
            </Text>
          )}

          <Text style={styles.timestamp}>
            {formatTime(moodLog.timestamp)}
          </Text>
        </View>

        {/* Accent Line */}
        <View style={[styles.accentLine, { backgroundColor: moodColor }]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  moodIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  moodEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  moodText: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  ratingStar: {
    fontSize: 12,
    marginLeft: 2,
  },
  note: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: fontSizes.md * 1.3,
  },
  timestamp: {
    fontSize: fontSizes.sm,
    color: colors.gray,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
});

// Add default export
export default MoodLogItem;
