//types/chat.ts
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
  };
  timestamp: string;
  status: 'sending' | 'sent' | 'failed' | 'read';
  reactions: {
    [key: string]: string[];
  };
  // Make these optional if they might not be present
  deleted?: boolean;
  edit_history?: {
    id: string;
    content: string;
    timestamp: string;
  }[];
  is_chatbot?: boolean;
  // Add any missing fields from WebSocket payload
  conversation?: number;
  message_type?: string;
}

export interface MessageProps {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
  };
  timestamp: string;
  edited?: boolean;
  edited_at?: string;
  reactions?: Record<string, string[]>;
  read_by?: string[];
  message_type?: 'text' | 'system';
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface Conversation {
  id: string;
  name?: string;
  title?: string; // For displaying conversation title
  // API returns snake_case fields
  last_message?: string;     // Matches Django's field name for last message    
  unread_count?: number;     // Matches Django's field name for unread count
  // Optional camelCase aliases for internal usage
  lastMessage?: string;
  unreadCount?: number;
  participants?: Participant[];
  otherParticipant?: Participant; // For one-to-one chats
  timestamp?: string;
  conversation_type: 'direct' | 'group' | 'one_to_one' | 'chatbot';
  isTyping?: boolean; // Added optional property
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

// Helper types for API responses
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status_code?: number;
}

// New interfaces for message pagination
export interface PaginatedMessagesResponse {
  results: Message[];
  has_more: boolean;
  next_cursor?: string;
  count?: number;
}