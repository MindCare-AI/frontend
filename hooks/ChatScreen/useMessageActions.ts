//screens/ChatScreen/hooks/useMessageActions.ts
import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config';
import { Message } from '../../types/chat';

// Define the conversation types
type ConversationType = 'one_to_one' | 'group' | 'chatbot';

interface UseMessageActionsProps {
  conversationId: string;
  conversationType: ConversationType;
}

const useMessageActions = ({ conversationId, conversationType }: UseMessageActionsProps) => {
  // Extract the current user as well as the access token.
  const { accessToken, user } = useAuth();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const addReactionAPI = async (
    messageId: string,
    reaction: string,
    conversationId: string,
    conversationType: ConversationType,
    accessToken: string,
    userId: string
  ): Promise<void> => {
    if (conversationType === 'chatbot') {
      console.warn('Reactions not supported for chatbot messages');
      return;
    }

    // Get the right endpoint based on conversation type
    const endpoint = conversationType === 'group' ? 'groups' : 'one_to_one';

    // The API structure differs between endpoints
    let requestBody = {};

    if (conversationType === 'group') {
      requestBody = {
        conversation: parseInt(conversationId, 10),
        reactions: { [reaction]: [userId] }
      };
    } else {
      // For one-to-one messages
      requestBody = {
        [reaction]: userId
      };
    }

    const url = `${API_BASE_URL}/messaging/${endpoint}/messages/${messageId}/reactions/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add reaction: ${errorText}`);
    }
  };

  const handleMessagePress = (message: Message): void => {
    setSelectedMessage(message);
    setShowActions(true);
  };

  const handleReactionSelect = useCallback(async (reaction: string): Promise<void> => {
    if (!selectedMessage || !accessToken || !user) return;
    try {
      await addReactionAPI(
        selectedMessage.id, 
        reaction, 
        conversationId, 
        conversationType,
        accessToken, 
        user.id.toString() // Convert numeric user id to string
      );
      console.log(`Added reaction ${reaction} to message ${selectedMessage.id}`);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
    setShowReactions(false);
  }, [selectedMessage, accessToken, user, conversationId, conversationType]);

  const removeReaction = async (messageId: string, reaction: string): Promise<void> => {
    if (!accessToken || !user) return;

    if (conversationType === 'chatbot') {
      console.warn('Reactions not supported for chatbot messages');
      return;
    }

    try {
      // Get the right endpoint based on conversation type
      const endpoint = conversationType === 'group' ? 'groups' : 'one_to_one';

      // Updated URL with API_BASE_URL without '/api/v1'
      const url = `${API_BASE_URL}/messaging/${endpoint}/messages/${messageId}/reactions/`;

      const options: RequestInit = {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove reaction: ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  return {
    selectedMessage,
    showActions,
    showReactions,
    handleMessagePress,
    handleReactionSelect,
    removeReaction,
    setShowActions,
    setShowReactions,
  };
};

export default useMessageActions;