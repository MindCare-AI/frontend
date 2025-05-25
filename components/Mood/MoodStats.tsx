import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors, spacing, fontSizes, shadows, borderRadius } from '../Journal/theme';

interface MoodLog {
  id: number;
  mood: string;
  rating: number;
  note: string;
  timestamp: string;
}

interface MoodStatsProps {
  moodLogs: MoodLog[];
}

const { width } = Dimensions.get('window');

export const MoodStats: React.FC<MoodStatsProps> = ({ moodLogs }) => {
  const stats = useMemo(() => {
    if (moodLogs.length === 0) {
      return {
        averageRating: 0,
        totalLogs: 0,
        mostCommonMood: 'N/A',
        weeklyAverage: 0,
      };
    }

    const totalRating = moodLogs.reduce((sum, log) => sum + log.rating, 0);
    const averageRating = totalRating / moodLogs.length;

    // Count mood frequencies
    const moodCounts: { [key: string]: number } = {};
    moodLogs.forEach(log => {
      moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    });

    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    // Calculate weekly average (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyLogs = moodLogs.filter(log => 
      new Date(log.timestamp) >= weekAgo
    );
    
    const weeklyTotal = weeklyLogs.reduce((sum, log) => sum + log.rating, 0);
    const weeklyAverage = weeklyLogs.length > 0 ? weeklyTotal / weeklyLogs.length : 0;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalLogs: moodLogs.length,
      mostCommonMood: mostCommonMood.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      weeklyAverage: Math.round(weeklyAverage * 10) / 10,
    };
  }, [moodLogs]);

  const StatCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
    <View style={[styles.statCard, shadows.sm]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Mood Insights</Text>
      
      <View style={styles.statsGrid}>
        <StatCard
          title="Average Rating"
          value={stats.averageRating || 'N/A'}
          subtitle="out of 5"
        />
        
        <StatCard
          title="Total Logs"
          value={stats.totalLogs}
          subtitle="entries"
        />
        
        <StatCard
          title="Most Common"
          value={stats.mostCommonMood}
          subtitle="mood"
        />
        
        <StatCard
          title="Weekly Average"
          value={stats.weeklyAverage || 'N/A'}
          subtitle="last 7 days"
        />
      </View>

      {moodLogs.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Start logging your moods to see personalized insights and trends
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: (width - spacing.lg * 3) / 2 - spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.gray,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSizes.md * 1.4,
  },
});
