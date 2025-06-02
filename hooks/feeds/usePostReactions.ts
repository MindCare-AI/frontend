import { useState, useCallback } from 'react';
import * as FeedsApi from '../../API/feeds';

export const usePostReactions = (postId: number, initialReaction: string | null = null) => {
  const [userReaction, setUserReaction] = useState<string | null>(initialReaction);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addReaction = useCallback(async (reactionType: string) => {
    try {
      setLoading(true);
      if (userReaction === reactionType) {
        await FeedsApi.removeReaction(postId);
        setUserReaction(null);
      } else {
        await FeedsApi.addReaction(postId, { reaction_type: reactionType });
        setUserReaction(reactionType);
      }
      setError(null);
      return userReaction === reactionType ? null : reactionType;
    } catch (err) {
      console.error('Error adding reaction:', err);
      setError('Failed to update reaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [postId, userReaction]);

  const toggleLike = useCallback(async () => {
    try {
      setLoading(true);
      // Use the dedicated likePost function instead of generic addReaction
      await FeedsApi.likePost(postId);
      
      // Toggle the reaction state
      const newReaction = userReaction === 'like' ? null : 'like';
      setUserReaction(newReaction);
      setError(null);
      
      return newReaction;
    } catch (err) {
      console.error('Error toggling like:', err);
      setError('Failed to like post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [postId, userReaction]);

  return {
    userReaction,
    loading,
    error,
    addReaction,
    toggleLike,
  };
};
