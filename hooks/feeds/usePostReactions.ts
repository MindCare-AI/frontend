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
    return await addReaction('like');
  }, [addReaction]);

  return {
    userReaction,
    loading,
    error,
    addReaction,
    toggleLike,
  };
};
