import { useState, useEffect, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios'; // Add this import to fix "axios is not defined" error
import * as FeedsApi from '../../API/feeds';
import { Post, FilterState, SortOption } from '../../types/feeds/index';

interface UsePostsParams {
  initialFilters?: FilterState;
  initialSort?: SortOption;
  searchQuery?: string;
  initialTab?: string;
}

export const usePosts = ({
  initialFilters = { topics: [], types: [], tags: [], users: [] },
  initialSort = 'newest',
  searchQuery = '',
  initialTab = 'for-you',
}: UsePostsParams = {}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Add explicit loading states for different operations
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadPosts = useCallback(
    async (refresh = false, loadMore = false, showLoading = true) => {
      try {
        // Set appropriate loading states
        if (refresh) {
          setRefreshing(true);
        } else if (loadMore) {
          setIsLoadingMore(true);
        } else if (showLoading) {
          setLoading(true);
          setIsInitialLoading(true);
        }

        setError(null);

        // Build query params - SIMPLIFIED to ensure posts are shown
        const params: Record<string, any> = {
          page: loadMore ? page + 1 : 1,
          ordering: '-created_at', // Always sort by newest to ensure we see posts
        };

        // Only apply filters if explicitly set
        if (initialFilters.topics.length > 0) {
          params.topic = initialFilters.topics.join(',');
        }
        if (initialFilters.types.length > 0) {
          params.post_type = initialFilters.types.map(type => type.toLowerCase()).join(',');
        }
        if (initialFilters.tags.length > 0) {
          params.tag = initialFilters.tags.join(',');
        }
        if (searchQuery) {
          params.search = searchQuery;
        }
        // Remove following filter to see all posts
        // if (activeTab === 'following') {
        //   params.following = true;
        // }

        console.log("DEBUG: Fetching posts with params:", params);
        
        // Fix the axios reference
        // Instead of directly checking axios, we'll use a safer approach
        try {
          const authHeader = axios.defaults.headers.common['Authorization'];
          console.log("DEBUG: Auth header present:", !!authHeader);
        } catch (e) {
          console.log("DEBUG: Could not check auth header:", e);
        }

        const response = await FeedsApi.fetchPosts(params) as { results: Post[]; next?: string } | Post[];
        console.log("DEBUG: Raw API response:", JSON.stringify(response));
        
        let newPosts: Post[];
        let hasNext = false;
        if (Array.isArray(response)) {
          newPosts = response;
        } else {
          newPosts = response.results;
          hasNext = !!response.next;
        }

        console.log("DEBUG: Processed posts count:", newPosts?.length || 0);

        // Remove sensitive content filter to ensure ALL posts show
        // const filteredPosts = newPosts.filter(post => 
        //   post.content !== 'i want to die' && post.content?.trim() !== ''
        // );
        const filteredPosts = newPosts; // Show all posts
        
        console.log("DEBUG: Posts after processing:", filteredPosts.length);
        console.log("DEBUG: First post:", filteredPosts.length > 0 ? JSON.stringify(filteredPosts[0]) : "No posts");

        if (refresh) {
          setPosts(filteredPosts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...filteredPosts]);
        }

        // Update hasMore based on response
        if (!hasNext || newPosts.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts. Please try again.');
      } finally {
        // Clear all loading states
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
        setIsInitialLoading(false);
      }
    },
    [searchQuery, initialSort, initialTab, initialFilters, page, posts.length]
  );

  const isFocused = useIsFocused();

  // Initial load
  useEffect(() => {
    console.log('DEBUG: Initial posts load triggered');
    loadPosts(false, false, true); // Show loading for initial load
  }, []);

  // Reload when dependencies change
  useEffect(() => {
    if (posts.length > 0) { // Only reload if we already have posts
      console.log('DEBUG: Reloading posts due to dependency change');
      loadPosts(false, false, true);
    }
  }, [searchQuery, initialSort, initialTab, JSON.stringify(initialFilters)]);

  const handleRefresh = useCallback(() => {
    console.log('DEBUG: Refreshing posts');
    setPage(1);
    setHasMore(true);
    loadPosts(true, false, false); // Don't show main loading spinner for refresh
  }, [loadPosts]);

  const handleLoadMore = useCallback(() => {
    if (!loading && !isLoadingMore && hasMore) {
      console.log('DEBUG: Loading more posts');
      loadPosts(false, true, false);
    }
  }, [loading, isLoadingMore, hasMore, loadPosts]);

  const updatePost = useCallback((postId: number, updates: Partial<Post>) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, ...updates } : post
      )
    );
  }, []);

  const deletePost = useCallback((postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);

  return {
    posts,
    loading: loading || isInitialLoading, // Combine loading states
    refreshing,
    error,
    hasMore,
    isLoadingMore,
    handleRefresh,
    handleLoadMore,
    updatePost,
    deletePost,
    loadPosts,
  };
};
