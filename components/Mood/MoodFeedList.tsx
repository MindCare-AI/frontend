import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, fontSizes } from '../Journal/theme';
import MoodLogItem from './MoodLogItem';

interface MoodLog {
  id: number;
  mood: string;
  rating: number;
  note: string;
  timestamp: string;
}

interface MoodFeedListProps {
  moodLogs: MoodLog[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const MoodFeedList = memo<MoodFeedListProps>(({ 
  moodLogs = [], 
  loading = false,
  onRefresh 
}) => {
  // Memoize the logs to prevent unnecessary re-renders
  const memoizedLogs = useMemo(() => {
    return moodLogs.slice().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [moodLogs]);

  const renderMoodItem = ({ item, index }: { item: MoodLog; index: number }) => (
    <MoodLogItem 
      moodLog={item} 
      index={index}
      style={styles.moodItem}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📊</Text>
      <Text style={styles.emptyTitle}>No mood logs yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your mood to see your patterns over time
      </Text>
    </View>
  );

  const renderLoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading mood logs...</Text>
    </View>
  );

  if (loading && memoizedLogs.length === 0) {
    return renderLoadingComponent();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={memoizedLogs}
        renderItem={renderMoodItem}
        keyExtractor={(item) => `mood-${item.id}`}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[
          styles.listContent,
          memoizedLogs.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
      />
    </View>
  );
});

MoodFeedList.displayName = 'MoodFeedList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  moodItem: {
    marginBottom: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSizes.md * 1.4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
