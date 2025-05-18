"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import type { FilterState, Post } from "../../types/feeds/feed"
import PostItem from "./PostItem"
import EmptyFeed from "./EmptyFeed"
import ErrorFeed from "./ErrorFeed"
import CreatePostButton from "./CreatePostButton"
import { MOCK_POSTS } from "../../data/feeds/mockData"

interface FeedContainerProps {
  filters?: FilterState
  sortBy?: string
  searchQuery?: string
  activeTab?: string
}

const FeedContainer: React.FC<FeedContainerProps> = ({
  filters = { topics: [], types: [], tags: [], users: [] },
  sortBy = "newest",
  searchQuery = "",
  activeTab = "for-you",
}) => {
  const { colors } = useTheme()
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(MOCK_POSTS)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const postsPerPage = 10

  // Apply filters and sorting whenever they change
  useEffect(() => {
    setIsLoading(true)

    // Simulate API delay
    const timer = setTimeout(() => {
      try {
        let result = [...posts]

        // Apply search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          result = result.filter(
            (post) =>
              post.content.toLowerCase().includes(query) ||
              post.author.name.toLowerCase().includes(query) ||
              post.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
              post.topic?.toLowerCase().includes(query),
          )
        }

        // Apply topic filters
        if (filters.topics.length) {
          result = result.filter((post) => post.topic && filters.topics.includes(post.topic))
        }

        // Apply type filters
        if (filters.types.length) {
          result = result.filter((post) => filters.types.map((t) => t.toLowerCase()).includes(post.post_type))
        }

        // Apply tag filters
        if (filters.tags.length) {
          result = result.filter((post) => post.tags?.some((tag) => filters.tags.includes(tag)))
        }

        // Apply user filters
        if (filters.users.length) {
          result = result.filter((post) => filters.users.includes(post.author.name))
        }

        // Apply sorting
        switch (sortBy) {
          case "newest":
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            break
          case "most-viewed":
            result.sort((a, b) => b.views_count - a.views_count)
            break
          case "most-reactions":
            result.sort((a, b) => {
              const totalA = Object.values(a.reactions).reduce((sum, count) => sum + count, 0)
              const totalB = Object.values(b.reactions).reduce((sum, count) => sum + count, 0)
              return totalB - totalA
            })
            break
        }

        setFilteredPosts(result)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to apply filters. Please try again.")
        setIsLoading(false)
      }
    }, 500) // Simulate a short delay for API call

    return () => clearTimeout(timer)
  }, [posts, filters, sortBy, searchQuery, activeTab])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // In a real app, you would fetch new data here
      setIsRefreshing(false)
    } catch (err) {
      setError("Failed to refresh feed. Please try again.")
      setIsRefreshing(false)
    }
  }

  // Load more posts
  const handleLoadMore = async () => {
    if (isLoading || page * postsPerPage >= filteredPosts.length) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setPage((prev) => prev + 1)
      setIsLoading(false)
    } catch (err) {
      setError("Failed to load more posts. Please try again.")
      setIsLoading(false)
    }
  }

  // Update post (for saving, reactions, etc.)
  const handleUpdatePost = (postId: string, updates: Partial<Post>) => {
    setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, ...updates } : post)))
  }

  if (error) {
    return <ErrorFeed error={error} onRetry={handleRefresh} />
  }

  if (filteredPosts.length === 0 && !isLoading && !isRefreshing) {
    return <EmptyFeed />
  }

  const currentPosts = filteredPosts.slice(0, page * postsPerPage)

  return (
    <View style={styles.container}>
      <FlatList
        data={currentPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostItem post={item} onUpdatePost={(updates) => handleUpdatePost(item.id, updates)} />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && !isRefreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : null
        }
      />
      <CreatePostButton position="bottom-right" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for the create post button
  },
  separator: {
    height: 16,
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
})

export default FeedContainer
