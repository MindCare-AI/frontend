import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, fontSizes, shadows, borderRadius } from '../../components/Journal/theme';
import { MoodFeedList } from '../../components/Mood/MoodFeedList';
import { MoodTracker } from '../../components/Mood/MoodTracker';
import { MoodStats } from '../../components/Mood/MoodStats';

const { width } = Dimensions.get('window');

export default function MoodScreen() {
  const [refreshing, setRefreshing] = useState(false);
  type MoodLog = {
    id: number;
    mood: string;
    rating: number;
    note: string;
    timestamp: string;
  };
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Prevent excessive API calls with debouncing
  const fetchMoodData = useCallback(async (force = false) => {
    const now = Date.now();
    // Prevent fetching more than once every 5 seconds unless forced
    if (!force && now - lastFetchTime < 5000) {
      return;
    }

    try {
      setLoading(true);
      setLastFetchTime(now);
      
      // Replace with your actual API call
      // const response = await fetchMoodLogs();
      // setMoodLogs(response.data || []);
      
      // Mock data for now
      setMoodLogs([
        {
          id: 1,
          mood: 'happy',
          rating: 4,
          note: 'Had a great day!',
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          mood: 'calm',
          rating: 3,
          note: 'Feeling peaceful',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching mood data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lastFetchTime]);

  // Use useFocusEffect instead of useEffect to prevent excessive calls
  useFocusEffect(
    useCallback(() => {
      // Only log once per focus, not continuously
      const shouldLog = Date.now() - lastFetchTime > 5000;
      if (shouldLog) {
        console.log('Screen focused, fetching data...');
      }
      
      fetchMoodData(true);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        // Cleanup if needed
        fadeAnim.setValue(0);
        slideAnim.setValue(30);
      };
    }, [fetchMoodData, fadeAnim, slideAnim, lastFetchTime])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMoodData(true);
  }, [fetchMoodData]);

  const handleMoodLogged = useCallback((newMoodLog: MoodLog) => {
    setMoodLogs(prev => [newMoodLog, ...prev]);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mood Tracker</Text>
          <Text style={styles.subtitle}>Track and understand your emotions</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Mood Tracker Component - Highlighted section */}
          <Animated.View style={styles.trackerSection}>
            <MoodTracker onMoodLogged={handleMoodLogged} />
          </Animated.View>

          {/* Mood Statistics */}
          <Animated.View style={styles.section}>
            <MoodStats moodLogs={moodLogs} />
          </Animated.View>

          {/* Recent Mood Logs */}
          <Animated.View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Mood History</Text>
            <MoodFeedList 
              moodLogs={moodLogs} 
              loading={loading}
              onRefresh={onRefresh}
            />
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  trackerSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});
