import { useState, useEffect, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { MOCK_POSTS, MOCK_USERS } from '../../data/tunisianMockData';
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

        console.log("DEBUG: Using mock data for posts");
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use mock data instead of API
        let filteredPosts = [...MOCK_POSTS].map(mockPost => ({
          id: typeof mockPost.id === 'string' ? parseInt(mockPost.id.toString().replace(/\D/g, '')) || Math.floor(Math.random() * 1000) : mockPost.id as number,
          author: typeof mockPost.author.id === 'string' ? parseInt(mockPost.author.id.toString().replace(/\D/g, '')) || Math.floor(Math.random() * 1000) : mockPost.author.id as number,
          author_name: mockPost.author.full_name,
          author_profile_pic: mockPost.author.profile_pic,
          author_user_type: mockPost.author.user_type,
          content: mockPost.content,
          post_type: 'discussion',
          topics: mockPost.topics?.[0] || 'Mental Health',
          visibility: 'public',
          created_at: mockPost.created_at,
          updated_at: mockPost.updated_at,
          media_files: mockPost.media_files?.map(media => ({
            id: parseInt(media.id.replace(/\D/g, '')) || Math.floor(Math.random() * 1000),
            file: media.url,
            media_type: media.type,
            uploaded_by: {
              id: typeof mockPost.author.id === 'string' ? parseInt(mockPost.author.id.toString().replace(/\D/g, '')) || Math.floor(Math.random() * 1000) : mockPost.author.id as number,
              username: mockPost.author.username,
              name: mockPost.author.full_name,
              profile_pic: mockPost.author.profile_pic
            }
          })) || [],
          views_count: Math.floor(Math.random() * 100) + 10,
          tags: mockPost.tags?.join(',') || '',
          reactions_summary: {
            like: mockPost.reactions.filter(r => r.type === 'like').length,
            love: mockPost.reactions.filter(r => r.type === 'love').length,
            support: mockPost.reactions.filter(r => r.type === 'support').length,
            insightful: mockPost.reactions.filter(r => r.type === 'insightful').length,
          },
          current_user_reaction: null,
          comments_count: mockPost.comments.length,
          poll_options: []
        } as Post));
        
        // Apply search filter
        if (searchQuery) {
          filteredPosts = filteredPosts.filter(post => 
            post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author_name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Apply topic filter
        if (initialFilters.topics.length > 0) {
          filteredPosts = filteredPosts.filter(post => {
            const postTopic = typeof post.topics === 'string' ? post.topics : post.topics?.name || '';
            return initialFilters.topics.includes(postTopic);
          });
        }
        
        // Apply sorting
        switch (initialSort) {
          case 'newest':
            filteredPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            break;
          case 'most-viewed':
            filteredPosts.sort((a, b) => b.views_count - a.views_count);
            break;
          case 'most-reactions':
            const getReactionCount = (post: Post) => {
              const summary = post.reactions_summary;
              return (summary.like || 0) + (summary.love || 0) + (summary.support || 0) + (summary.insightful || 0);
            };
            filteredPosts.sort((a, b) => getReactionCount(b) - getReactionCount(a));
            break;
          case 'popular':
            filteredPosts.sort((a, b) => (b.views_count + b.comments_count) - (a.views_count + a.comments_count));
            break;
          default:
            break;
        }

        console.log("DEBUG: Processed posts count:", filteredPosts.length);

        if (refresh || !loadMore) {
          setPosts(filteredPosts);
        } else {
          // For load more, just append (though with mock data we don't really paginate)
          setPosts(prevPosts => [...prevPosts, ...filteredPosts.slice(prevPosts.length)]);
        }

        // Mock pagination - assume we have more if we're showing less than total
        setHasMore(false); // For demo, don't implement pagination
        
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
    [searchQuery, initialSort, initialTab, initialFilters]
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
