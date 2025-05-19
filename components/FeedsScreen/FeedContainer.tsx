"use client"

import { forwardRef, useImperativeHandle, useState, useEffect } from "react"
import { View, FlatList, Text, StyleSheet } from "react-native"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import type { FilterState, SortOption } from "../../types/feeds"
import PostItem from "./PostItem"
import LoadingIndicator from "../../components/common/LoadingIndicator"
import ErrorMessage from "../common/ErrorMessage"
import { usePosts } from "../../hooks/feeds/usePosts"

interface FeedContainerProps {
  filters: FilterState
  sortBy: SortOption
  searchQuery: string
  activeTab: string
}

const FeedContainer = forwardRef(({ 
  filters, 
  sortBy, 
  searchQuery, 
  activeTab 
}: FeedContainerProps, ref) => {
  const { colors } = useTheme()
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  
  const {
    posts,
    loading,
    refreshing,
    error,
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
  
  // Expose the refresh method to parent components
  useImperativeHandle(ref, () => ({
    refresh: () => handleRefresh()
  }))
  
  if (loading && !refreshing && posts.length === 0) {
    return <LoadingIndicator />
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={handleRefresh} />
  }
  
  if (posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No posts found. Try different filters or follow more users.
        </Text>
      </View>
    )
  }
  
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <PostItem 
          post={item} 
          onUpdatePost={(updates) => updatePost(item.id, updates)} 
        />
      )}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.listContainer}
    />
  )
})

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
})

export default FeedContainer
