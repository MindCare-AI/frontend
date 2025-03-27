//screens/MessagingScreen/hooks/useConversationActions.ts
import { useState } from 'react';
import { Conversation } from '../../../types/chat';
import { API_BASE_URL } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';

const deleteConversation = async (conversation: Conversation, accessToken: string): Promise<void> => {
  // Get the right endpoint based on conversation type
  const endpoint = conversation.conversation_type === 'group' ? 'groups' : 'one_to_one';
  
  const response = await fetch(`${API_BASE_URL}/api/v1/messaging/${endpoint}/${conversation.id}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete conversation');
  }
};

const markAsRead = async (conversation: Conversation, accessToken: string): Promise<void> => {
  // Get the right endpoint based on conversation type
  const endpoint = conversation.conversation_type === 'group' ? 'groups' : 'one_to_one';
  
  const response = await fetch(`${API_BASE_URL}/api/v1/messaging/${endpoint}/${conversation.id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ unread_count: 0 }),
  });
  if (!response.ok) {
    throw new Error('Failed to mark conversation as read');
  }
};

const useConversationActions = () => {
  const { accessToken } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showActions, setShowActions] = useState<boolean>(false);

  const handleConversationPress = async (conversation: Conversation): Promise<void> => {
    if (accessToken) {
      try {
        await markAsRead(conversation, accessToken);
      } catch (error) {
        console.error(error);
      }
    }
    setSelectedConversation(conversation);
  };

  const handleLongPress = (conversation: Conversation): void => {
    setSelectedConversation(conversation);
    setShowActions(true);
  };

  const handleDelete = async (): Promise<boolean> => {
    if (!selectedConversation || !accessToken) return false;
    try {
      await deleteConversation(selectedConversation, accessToken);
      setShowActions(false);
      return true;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return false;
    }
  };

  return {
    selectedConversation,
    showActions,
    setShowActions,
    handleConversationPress,
    handleLongPress,
    handleDelete,
  };
};

export default useConversationActions;
