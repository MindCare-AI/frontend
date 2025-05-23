// Chatbot related type definitions

// Define types locally instead of importing from missing module
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export interface MessageAttachment {
  id: string;
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  user_id: string;
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
  is_bot?: boolean;
  // WebSocket specific fields
  conversation_id?: string;
  websocket_event?: string;
}

export interface MessageRequest {
  content: string;
  conversation_id: string;
  message_type: MessageType;
  attachment?: MessageAttachment;
  // WebSocket metadata
  metadata?: {
    is_chatbot?: boolean;
    [key: string]: any;
  };
}

export interface ChatbotConversation {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  title?: string;
  // WebSocket connection status
  is_websocket_connected?: boolean;
}

export interface ChatbotState {
  currentConversation: ChatbotConversation | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  // WebSocket connection state
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

// WebSocket specific types for chatbot
export interface ChatbotWebSocketMessage {
  type: 'message' | 'typing' | 'bot_response';
  content?: string;
  message_id?: string;
  conversation_id?: string;
  is_bot?: boolean;
  sender_id?: string;
  timestamp?: string;
  metadata?: {
    is_chatbot: boolean;
    bot_action?: string;
    [key: string]: any;
  };
}