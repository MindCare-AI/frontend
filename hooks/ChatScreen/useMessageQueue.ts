import { useEffect, useCallback, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import messageQueue from '../../services/messageQueue';
import { Message, MessageRequest } from '../../types/chat';

interface UseMessageQueueOptions {
  conversationId: string;
  onMessageSent?: (message: Message) => void;
  onMessageFailed?: (messageId: string, error: Error) => void;
}

export const useMessageQueue = ({
  conversationId,
  onMessageSent,
  onMessageFailed,
}: UseMessageQueueOptions) => {
  const netInfo = useNetInfo();
  const [queuedMessages, setQueuedMessages] = useState<MessageRequest[]>([]);
  const [failedMessages, setFailedMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState<string>('');

  // Load draft message on mount
  useEffect(() => {
    const loadDraft = async () => {
      const savedDraft = await messageQueue.getDraft(conversationId);
      if (savedDraft) {
        setDraft(savedDraft);
      }
    };
    loadDraft();
  }, [conversationId]);

  // Save draft when component unmounts or draft changes
  useEffect(() => {
    const saveDraft = async () => {
      if (draft) {
        await messageQueue.saveDraft(conversationId, draft);
      } else {
        await messageQueue.clearDraft(conversationId);
      }
    };

    saveDraft();
  }, [draft, conversationId]);

  // Load failed messages
  useEffect(() => {
    const loadFailedMessages = async () => {
      const failed = await messageQueue.getFailedMessages();
      setFailedMessages(failed.map(m => m.id));
    };
    loadFailedMessages();
  }, []);

  const queueMessage = useCallback(async (
    content: string,
    type: string = 'text',
    metadata?: any
  ) => {
    const messageRequest: MessageRequest = {
      content,
      conversation_id: conversationId,
      message_type: type,
      metadata,
    };

    if (!netInfo.isConnected) {
      const queuedId = await messageQueue.queueMessage(messageRequest);
      setQueuedMessages(prev => [...prev, { ...messageRequest, id: queuedId }]);
      return queuedId;
    }

    try {
      const sentMessage = await sendMessage(messageRequest);
      onMessageSent?.(sentMessage);
      return sentMessage.id;
    } catch (error) {
      const queuedId = await messageQueue.queueMessage(messageRequest);
      setQueuedMessages(prev => [...prev, { ...messageRequest, id: queuedId }]);
      return queuedId;
    }
  }, [conversationId, netInfo.isConnected, onMessageSent]);

  const retryMessage = useCallback(async (messageId: string) => {
    try {
      await messageQueue.retryFailedMessage(messageId);
      setFailedMessages(prev => prev.filter(id => id !== messageId));
    } catch (error) {
      console.error('Error retrying message:', error);
      onMessageFailed?.(messageId, error as Error);
    }
  }, [onMessageFailed]);

  const updateDraft = useCallback((newDraft: string) => {
    setDraft(newDraft);
  }, []);

  const clearDraft = useCallback(async () => {
    setDraft('');
    await messageQueue.clearDraft(conversationId);
  }, [conversationId]);

  return {
    queueMessage,
    retryMessage,
    queuedMessages,
    failedMessages,
    draft,
    updateDraft,
    clearDraft,
    isOffline: !netInfo.isConnected,
  };
};

export default useMessageQueue;