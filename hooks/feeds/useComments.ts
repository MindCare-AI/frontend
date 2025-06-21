import { useState, useEffect, useCallback } from 'react';
import { MOCK_POSTS, MOCK_USERS } from '../../data/tunisianMockData';
import type { Comment } from '../../types/feeds/index';

export const useComments = (postId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find comments for this post from mock data
      const mockPost = MOCK_POSTS.find(post => {
        // Convert the numeric postId back to the original string format
        const originalPostId = `post_${postId}`;
        const postIdStr = typeof postId === 'string' ? postId : postId.toString();
        const mockPostIdStr = typeof post.id === 'string' ? post.id : post.id.toString();
        
        // Try both the numeric string and the original format
        return mockPostIdStr === postIdStr || mockPostIdStr === originalPostId;
      });
      
      if (mockPost && mockPost.comments) {
        const formattedComments: Comment[] = mockPost.comments.map((comment, index) => ({
          id: parseInt(comment.id) || index + 1,
          post: typeof postId === 'string' ? parseInt(postId) || 1 : postId,
          author: typeof comment.author.id === 'string' ? parseInt(comment.author.id.toString().replace(/\D/g, '')) || Math.floor(Math.random() * 1000) : comment.author.id as number,
          author_name: comment.author.full_name,
          author_profile_pic: comment.author.profile_pic,
          content: comment.content,
          parent: undefined,
          created_at: comment.created_at,
          updated_at: comment.created_at,
          is_edited: false,
          reactions_count: Math.floor(Math.random() * 10),
          replies_count: comment.replies?.length || 0,
          current_user_reaction: null
        }));
        setComments(formattedComments);
      } else {
        setComments([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId, loadComments]);

  const addComment = useCallback(async (content: string) => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create a mock comment
      const mockComment: Comment = {
        id: Date.now(), // Use timestamp as temp ID
        post: typeof postId === 'string' ? parseInt(postId) || 1 : postId,
        author: 1, // Current user ID - should come from auth context
        author_name: "You", // Current user name
        author_profile_pic: undefined,
        content: content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_edited: false,
        reactions_count: 0,
        replies_count: 0,
        current_user_reaction: null
      };
      
      setComments(prev => [mockComment, ...prev]);
      return mockComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addReply = useCallback(async (parentId: number, content: string) => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create a mock reply
      const mockReply: Comment = {
        id: Date.now(),
        post: typeof postId === 'string' ? parseInt(postId) || 1 : postId,
        author: 1,
        author_name: "You",
        author_profile_pic: undefined,
        content: content,
        parent: parentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_edited: false,
        reactions_count: 0,
        replies_count: 0,
        current_user_reaction: null
      };
      
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies_count: comment.replies_count + 1
          };
        }
        return comment;
      }));
      setReplyingTo(null);
      return mockReply;
    } catch (err) {
      console.error('Error adding reply:', err);
      setError('Failed to add reply');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const toggleReplies = useCallback((commentId: number) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
    // No backend replies structure, so nothing to fetch
  }, []);

  const reactToComment = useCallback(async (commentId: number, reactionType: string) => {
    try {
      // Optimistic update: just increment/decrement reactions_count
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const isTogglingOff = comment.current_user_reaction === reactionType;
          const delta = isTogglingOff ? -1 : 1;
          return {
            ...comment,
            current_user_reaction: isTogglingOff ? null : reactionType,
            reactions_count: Math.max(0, comment.reactions_count + delta)
          };
        }
        return comment;
      }));
      
      // Mock API call - simulate reaction success
      try {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log(`Mock reaction ${reactionType} applied to comment ${commentId}`);
      } catch (err) {
        console.error('Mock reaction error:', err);
        await loadComments(); // Revert optimistic update if needed
      }
    } catch (err) {
      console.error('Error reacting to comment:', err);
      await loadComments(); // Revert optimistic update
    }
  }, [comments, loadComments]);

  return {
    comments,
    loading,
    error,
    expandedComments,
    replyingTo,
    setReplyingTo,
    addComment,
    addReply,
    toggleReplies,
    reactToComment,
    refreshComments: loadComments
  };
};
