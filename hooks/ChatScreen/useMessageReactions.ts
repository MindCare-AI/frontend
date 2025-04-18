import { useState, useCallback } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { Message } from '../../types/chat';
import { useChat } from '../../contexts/ChatContext';
import chatService from '../../services/chatService';

interface UseMessageReactionsOptions {
  conversationId: string;
  onError?: (error: Error) => void;
}

export const useMessageReactions = ({
  conversationId,
  onError,
}: UseMessageReactionsOptions) => {
  const netInfo = useNetInfo();
  const { user } = useChat();
  const [pendingReactions, setPendingReactions] = useState<Map<string, Set<string>>>(new Map());

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!user || !netInfo.isConnected) return;

    // Optimistically update
    setPendingReactions(prev => {
      const newMap = new Map(prev);
      const messageReactions = new Set(prev.get(messageId) || []);
      messageReactions.add(reaction);
      newMap.set(messageId, messageReactions);
      return newMap;
    });

    try {
      await chatService.addReaction(messageId, reaction);
    } catch (error) {
      // Revert optimistic update
      setPendingReactions(prev => {
        const newMap = new Map(prev);
        const messageReactions = new Set(prev.get(messageId) || []);
        messageReactions.delete(reaction);
        if (messageReactions.size === 0) {
          newMap.delete(messageId);
        } else {
          newMap.set(messageId, messageReactions);
        }
        return newMap;
      });
      onError?.(error as Error);
    }
  }, [user, netInfo.isConnected, onError]);

  const removeReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!user || !netInfo.isConnected) return;

    // Optimistically update
    setPendingReactions(prev => {
      const newMap = new Map(prev);
      const messageReactions = new Set(prev.get(messageId) || []);
      messageReactions.delete(reaction);
      if (messageReactions.size === 0) {
        newMap.delete(messageId);
      } else {
        newMap.set(messageId, messageReactions);
      }
      return newMap;
    });

    try {
      await chatService.removeReaction(messageId, reaction);
    } catch (error) {
      // Revert optimistic update
      setPendingReactions(prev => {
        const newMap = new Map(prev);
        const messageReactions = new Set(prev.get(messageId) || []);
        messageReactions.add(reaction);
        newMap.set(messageId, messageReactions);
        return newMap;
      });
      onError?.(error as Error);
    }
  }, [user, netInfo.isConnected, onError]);

  const getMessageReactions = useCallback((message: Message) => {
    const pendingMessageReactions = pendingReactions.get(message.id);
    if (!pendingMessageReactions) {
      return message.reactions;
    }

    // Merge pending reactions with actual reactions
    const mergedReactions = { ...message.reactions };
    pendingMessageReactions.forEach(reaction => {
      if (!mergedReactions[reaction]) {
        mergedReactions[reaction] = [];
      }
      if (!mergedReactions[reaction].includes(user?.id || '')) {
        mergedReactions[reaction] = [...mergedReactions[reaction], user?.id || ''];
      }
    });

    return mergedReactions;
  }, [pendingReactions, user?.id]);

  const hasUserReacted = useCallback((message: Message, reaction: string) => {
    const pendingMessageReactions = pendingReactions.get(message.id);
    if (pendingMessageReactions?.has(reaction)) {
      return true;
    }
    return message.reactions[reaction]?.includes(user?.id || '') || false;
  }, [pendingReactions, user?.id]);

  return {
    addReaction,
    removeReaction,
    getMessageReactions,
    hasUserReacted,
    pendingReactions,
  };
};

export default useMessageReactions;