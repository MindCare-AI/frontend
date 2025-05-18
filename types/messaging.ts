export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
}

export interface MessageAttachment {
  id: string;
  url: string;
  type: 'image' | 'file';
  filename: string;
  mime_type: string;
  size: number;
  thumbnailUrl?: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  message_type: 'text' | 'image' | 'file';
  attachment?: MessageAttachment;
  reactions?: MessageReaction[];
  readBy?: string[];
  edited?: boolean;
}

export interface Conversation {
  id: string;
  type: 'one_to_one' | 'group';
  name?: string;
  participants: Participant[];
  unread_count: number;
  last_message?: Message;
  created_at: string;
  updated_at: string;
  otherParticipant?: Participant;
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  username: string;
  isTyping: boolean;
  timestamp: string;
}

export interface TypingUser {
  id: string;
  username: string;
}

export interface MessagingState {
  messages: { [conversationId: string]: Message[] };
  loadingMessages: boolean;
  hasMoreMessages: boolean;
  typingUsers: Set<TypingUser>;
  activeConversation: Conversation | null;
  conversations: Conversation[];
  loadingConversations: boolean;
  unreadCount: number;
}

export interface FileAttachment {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface MessageDraft {
  content: string;
  attachments: FileAttachment[];
}

export interface MessageQuery {
  conversation_id: string;
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
}

// WebSocket Event types for messaging
export type WebSocketEvent =
  | { type: 'message_created'; message: Message }
  | { type: 'typing'; conversation_id: string; user_id: string; username: string; is_typing: boolean }
  | { type: 'read_receipt'; user_id: string; username: string; message_id: string }
  | { type: 'reaction'; message_id: string; user_id: string; emoji: string; timestamp: string }
  | { type: 'presence'; user_id: string; online: boolean };