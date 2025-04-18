//types/chat.ts
export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationType = 'one_to_one' | 'group' | 'chatbot';
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  last_seen?: string;
}

export interface Participant extends Sender {
  last_seen?: string;
  is_online?: boolean;
  role?: 'admin' | 'member';
}

export interface Sender {
  id: string;
  name: string;
  avatar?: string;
  highlight_color?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file' | 'voice';
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number; // For audio/video
  dimensions?: {
    width: number;
    height: number;
  }; // For images/videos
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // Array of user IDs
}

export interface MessageMetadata {
  file_url?: string;
  file_name?: string;
  file_size?: number;
  duration?: number;
  waveform?: number[];
  preview_url?: string;
  mime_type?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    highlight_color?: string;
  };
  timestamp: string;
  status: MessageStatus;
  metadata?: MessageMetadata;
  attachments?: Attachment[];
  reactions?: Reaction[];
  isEdited?: boolean;
  readBy?: string[];
}

export interface MessageRequest {
  content: string;
  conversation_id: string;
  message_type?: MessageType;
  metadata?: any;
  reply_to_id?: string;
}

export interface Conversation {
  id: string;
  type: 'one_to_one' | 'group' | 'chatbot';
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
  name?: string; // For group conversations
  avatar?: string; // For group conversations
  metadata?: Record<string, any>;
  typingUsers?: string[];
}

export interface OneToOneConversation extends Conversation {
  conversation_type: 'one_to_one';
  other_participant: Participant;
}

export interface GroupConversation extends Conversation {
  conversation_type: 'group';
  description?: string;
  avatar?: string;
  member_count: number;
  owner_id: string;
  moderators: string[];
}

export interface ChatbotConversation extends Conversation {
  conversation_type: 'chatbot';
  metadata: {
    bot_name: string;
    bot_avatar: string;
    capabilities: string[];
    context?: any;
  };
}

export interface RouteProps {
  params: {
    conversationId: string;
  };
}

export interface ConversationSummary {
  id: string;
  title: string;
  last_message?: string;
  timestamp?: string;
  unread_count: number;
  participants: Participant[];
  avatar?: string; // For group chats or single user avatar
}

export interface PaginatedResponse<T> {
  data: T[];
  cursor?: string;
  has_more: boolean;
  total_count?: number;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status_code?: number;
}

export interface PaginatedMessagesResponse {
  messages: Message[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface PaginatedConversationsResponse {
  results: Conversation[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface SendMessageResponse {
  message: Message;
  conversation: Conversation;
}

export interface GetMessagesResponse extends PaginatedResponse<Message> {
  conversation: Conversation;
}

export interface MessageGroup {
  date: string;
  sender: User;
  messages: Message[];
}

export interface ReactionType {
  type: string;
  emoji: string;
  label: string;
}

export interface ReadReceipt {
  user_id: string;
  message_id: string;
  conversation_id: string;
  timestamp: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface MessageDraft {
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface AttachmentOptions {
  maxSize: number;
  allowedTypes: string[];
  compressionQuality?: number;
}

export interface VoiceMessageOptions {
  maxDuration: number;
  quality: 'low' | 'medium' | 'high';
}

export interface MessageAction {
  type: 'edit' | 'delete' | 'reply' | 'react' | 'forward';
  messageId: string;
  conversationId: string;
  payload?: any;
}