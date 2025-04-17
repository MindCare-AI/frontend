import { useState } from 'react';
import { Conversation } from '../../types/chat';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

const deleteConversation = async (conversation: Conversation, accessToken: string): Promise<void> => {
  const endpoint = conversation.conversation_type === 'group' ? 'groups' : 'one_to_one';
  const url = `${API_BASE_URL}/messaging/${endpoint}/${conversation.id}/`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete conversation: ${errorText}`);
  }
};

const markAsRead = async (conversation: Conversation, accessToken: string): Promise<void> => {
  const endpoint = conversation.conversation_type === 'group' ? 'groups' : 'one_to_one';
  const url = `${API_BASE_URL}/messaging/${endpoint}/${conversation.id}/`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ unread_count: 0 }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to mark conversation as read: ${errorText}`);
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
