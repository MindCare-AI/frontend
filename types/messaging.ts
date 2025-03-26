export interface User {
  id: number;
  username: string;
}

export interface Message {
  id: string | number;
  content: string;
  sender: User;
  timestamp: string;
  status?: 'sending' | 'sent' | 'failed';
  message_type?: string;
  is_edited?: boolean;
}

export interface Conversation {
  id: number | string;
  created_at: string;
  unread_count?: number;
}

export interface OneToOneConversation extends Conversation {
  id: number;
  other_user_name: string;
  other_user_id: number;
  last_message?: string;
  unread_count: number;
  created_at: string;
  // ... other fields you need
}

export interface GroupConversation extends Conversation {
  name: string;
  description?: string;
  participants: number[]; // Array of participant IDs
  moderators: number[]; // Array of moderator IDs
  is_private?: boolean;
  last_message?: {
    content: string;
    timestamp: string;
    sender_name: string;
  };
  participant_count?: number;
}

// Type guard to determine if a conversation is one-to-one
export function isOneToOneConversation(
  conversation: Conversation
): conversation is OneToOneConversation {
  return (conversation as OneToOneConversation).other_user_id !== undefined;
}

// Type guard to determine if a conversation is a group
export function isGroupConversation(
  conversation: Conversation
): conversation is GroupConversation {
  return (conversation as GroupConversation).name !== undefined;
}