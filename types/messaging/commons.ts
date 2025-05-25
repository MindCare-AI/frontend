export interface BaseParticipant {
  id: string | number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_pic?: string;
  user_type?: string;
}

export interface OtherParticipant {
  id: string | number;
  username: string;
  user_type: string;
  profile_pic?: string;
}

export interface BaseMessage {
  id: string | number;
  content: string;
  timestamp: string;
  message_type: 'text' | 'system' | 'image' | 'file';
  sender?: string | number;
  sender_id: string | number;
  sender_name: string;
  media: string | null;
  status?: 'sending' | 'sent' | 'failed' | 'delivered' | 'read';
  conversation?: string | number;
}

export interface BaseConversation {
  id: string | number;
  created_at: string;
  unread_count: number;
  participants: Array<string | number | BaseParticipant>;
  last_message: BaseMessage | null;
  messages?: BaseMessage[];
  is_group: boolean;
  name?: string;
  description?: string;
  other_participant?: OtherParticipant;
  other_user_name?: string;
  other_participants?: BaseParticipant[];
}

export interface User {
  id: string | number;
  username: string;
  email?: string;
  profile_pic?: string;
  user_type?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}
