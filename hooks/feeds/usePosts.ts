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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isFocused = useIsFocused();

  const loadPosts = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
      } else if (!refresh && !hasMore) {
        return;
      } else {
        setLoading(true);
      }

      // Build query params - SIMPLIFIED to ensure posts are shown
      const params: Record<string, any> = {
        page: refresh ? 1 : page,
        ordering: '-created_at', // Always sort by newest to ensure we see posts
      };

      // Only apply filters if explicitly set
      if (filters.topics.length > 0) {
        params.topic = filters.topics.join(',');
      }
      if (filters.types.length > 0) {
        params.post_type = filters.types.map(type => type.toLowerCase()).join(',');
      }
      if (filters.tags.length > 0) {
        params.tag = filters.tags.join(',');
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

      if (hasNext) {
        setHasMore(true);
        setPage(prevPage => prevPage + 1);
      } else {
        setHasMore(false);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, sortBy, searchQuery, activeTab, page, hasMore]);

  useEffect(() => {
    if (isFocused) {
      loadPosts(true);
    }
  }, [isFocused, activeTab]);

  useEffect(() => {
    loadPosts(true);
  }, [filters, sortBy, searchQuery]);

  const handleRefresh = async () => {
    loadPosts(true);
  };

  const handleLoadMore = async () => {
    if (!loading && !refreshing && hasMore) {
      loadPosts(false);
    }
  };

  const updatePost = useCallback((postId: number, updates: Partial<Post>) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, ...updates } : post
      )
    );
  }, []);

  return {
    posts,
    loading,
    refreshing,
    error,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    handleRefresh,
    handleLoadMore,
    updatePost,
  };
};
