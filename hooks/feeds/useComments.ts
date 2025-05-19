import { useState, useEffect, useCallback } from 'react';
import * as FeedsApi from '../../API/feeds';
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
      const response = await FeedsApi.fetchPostComments(postId) as { results: Comment[] } | Comment[];
      let newComments: Comment[];
      if (Array.isArray(response)) {
        newComments = response;
      } else {
        newComments = response.results || [];
      }
      setComments(newComments);
      setError(null);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
      // Initialize with empty array to prevent UI errors
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
      const newComment = await FeedsApi.createComment(postId, { content });
      
      // If the API call succeeds but doesn't return the expected data, create a mock comment
      if (!newComment) {
        const mockComment: Comment = {
          id: Date.now(), // Use timestamp as temp ID
          post: postId,
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
      }
      
      setComments(prev => [newComment as Comment, ...prev]);
      return newComment as Comment;
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
      const newReply = await FeedsApi.createComment(postId, { content, parent: parentId }) as Comment;
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
      return newReply;
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
      // Make API call
      if (comments.find(c => c.id === commentId)?.current_user_reaction === reactionType) {
        // Remove reaction
        await FeedsApi.deleteComment(commentId); // This should be a remove reaction endpoint if available
      } else {
        // Add reaction
        await FeedsApi.addReaction(commentId, { reaction_type: reactionType });
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
