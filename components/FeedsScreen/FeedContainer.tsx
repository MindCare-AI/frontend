"use client"

import { forwardRef, useImperativeHandle, useState, useEffect } from "react"
import { View, FlatList, Text, StyleSheet, RefreshControl, ActivityIndicator } from "react-native"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import type { FilterState, SortOption } from "../../types/feeds"
import PostItem from "./PostItem"
import LoadingIndicator from "../../components/common/LoadingIndicator"
import ErrorMessage from "../common/ErrorMessage"
import { usePosts } from "../../hooks/feeds/usePosts"
import EmptyFeed from "./EmptyFeed"

// Skeleton loader component for posts
const PostSkeleton = ({ colors }: { colors: any }) => (
  <View style={[styles.skeletonContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={styles.skeletonHeader}>
      <View style={[styles.skeletonAvatar, { backgroundColor: colors.highlight }]} />
      <View style={styles.skeletonHeaderText}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.highlight, width: 120 }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.highlight, width: 80, marginTop: 4 }]} />
      </View>
    </View>
    <View style={[styles.skeletonContent, { backgroundColor: colors.highlight }]} />
    <View style={[styles.skeletonMedia, { backgroundColor: colors.highlight }]} />
    <View style={styles.skeletonFooter}>
      <View style={[styles.skeletonButton, { backgroundColor: colors.highlight }]} />
      <View style={[styles.skeletonButton, { backgroundColor: colors.highlight }]} />
      <View style={[styles.skeletonButton, { backgroundColor: colors.highlight }]} />
    </View>
  </View>
)

interface FeedContainerProps {
  filters: FilterState
  sortBy: SortOption
  searchQuery: string
  activeTab: string
  onLoadingChange?: (loading: boolean) => void
}

const FeedContainer = forwardRef(({ 
  filters, 
  sortBy, 
  searchQuery, 
  activeTab,
  onLoadingChange
}: FeedContainerProps, ref) => {
  // Use HomeSettingsScreen color scheme
  const homeScreenColors = {
    primary: '#002D62',
    lightBlue: '#E4F0F6',
    white: '#FFFFFF',
    textDark: '#333',
    textMedium: '#444',
    borderColor: '#F0F0F0',
    background: '#FFFFFF',
  };

  const { colors } = useTheme()
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  
  const {
    posts,
    loading,
    refreshing,
    error,
    isLoadingMore,
    handleRefresh,
    handleLoadMore,
    updatePost,
  } = usePosts({
    initialFilters: filters,
    initialSort: sortBy,
    searchQuery,
    initialTab: activeTab,
  })
  
  // Implement auto-refresh if no posts are found initially
  useEffect(() => {
    if (!loading && !refreshing && posts.length === 0 && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        console.log(`Auto-refreshing feeds (attempt ${retryCount + 1}/${maxRetries})...`);
        handleRefresh();
        setRetryCount(prev => prev + 1);
      }, 2000); // Retry every 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [posts, loading, refreshing, retryCount, handleRefresh]);

  // Notify parent of loading state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading || refreshing);
    }
  }, [loading, refreshing, onLoadingChange]);
  
  // Expose the refresh method to parent components
  useImperativeHandle(ref, () => ({
    refresh: () => handleRefresh()
  }))

  // Handle post deletion
  const handleDeletePost = (postId: number) => {
    // Remove the post from the local state
    // The API call is handled in PostItem component
    // This just updates the UI immediately
    const timer = setTimeout(() => {
      // Refresh the feed to ensure consistency
      handleRefresh()
    }, 1000)
    
    return () => clearTimeout(timer)
  }
  
  // Show skeleton loading for initial load
  if (loading && !refreshing && posts.length === 0) {
    return (
      <View style={{ backgroundColor: homeScreenColors.background, flex: 1 }}>
        <LoadingIndicator />
        <PostSkeleton colors={homeScreenColors} />
        <PostSkeleton colors={homeScreenColors} />
        <PostSkeleton colors={homeScreenColors} />
      </View>
    )
  }
  
  if (error && posts.length === 0) {
    return <ErrorMessage message={error} onRetry={handleRefresh} />
  }
  
  if (!loading && posts.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: homeScreenColors.lightBlue }]}>
        <EmptyFeed />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <PostItem 
          post={item} 
          colors={homeScreenColors}
          onUpdatePost={(updates) => updatePost(item.id, updates)}
          onDeletePost={handleDeletePost}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={homeScreenColors.primary}
        />
      }
      style={{ backgroundColor: homeScreenColors.background }}
      ListFooterComponent={() => (
        isLoadingMore ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={homeScreenColors.primary} />
            <Text style={{ marginTop: 8, color: homeScreenColors.textMedium }}>
              Loading more posts...
            </Text>
          </View>
        ) : null
      )}
    />
  )
})

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    margin: 16,
  },
  skeletonContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  skeletonHeaderText: {
    flex: 1,
  },
  skeletonLine: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonContent: {
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  skeletonMedia: {
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  skeletonButton: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 4,
  },
})

export default FeedContainer
