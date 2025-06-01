// This utility file contains adapter functions for converting between different conversation models
import { Conversation } from '../components/Conversations/ConversationItem';

// Function to adapt direct conversation to the standard Conversation interface
export function adaptDirectConversation(directConversation: any): Conversation {
  return {
    id: directConversation.id,
    is_group: false,
    participants: directConversation.other_participant ? [directConversation.other_participant] : [],
    last_message: directConversation.last_message ? {
      id: directConversation.last_message.id || 0,
      content: directConversation.last_message.content || '',
      timestamp: directConversation.last_message.timestamp || new Date().toISOString(),
      sender_id: directConversation.last_message.sender_id || '',
      sender_name: directConversation.last_message.sender_name || '',
      is_read: directConversation.unread_count === 0
    } : undefined,
    unread_count: directConversation.unread_count || 0,
    other_participant: {
      id: directConversation.other_participant?.id || 0,
      username: directConversation.other_participant?.username || '',
      user_type: directConversation.other_participant?.user_type || 'user',
      profile_pic: directConversation.other_participant?.profile_pic
    }
  };
}

// Function to adapt group conversation to the standard Conversation interface
export function adaptGroupConversation(groupConversation: any): Conversation {
  return {
    id: groupConversation.id,
    is_group: true,
    name: groupConversation.name,
    participants: groupConversation.participants || [],
    last_message: groupConversation.last_message ? {
      id: groupConversation.last_message.id || 0,
      content: groupConversation.last_message.content || '',
      timestamp: groupConversation.last_message.timestamp || new Date().toISOString(),
      sender_id: groupConversation.last_message.sender_id || '',
      sender_name: groupConversation.last_message.sender_name || '',
      is_read: groupConversation.unread_count === 0
    } : undefined,
    unread_count: groupConversation.unread_count || 0,
  };
}
