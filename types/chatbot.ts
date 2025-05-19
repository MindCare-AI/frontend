// Core message types for chatbot
export interface ChatbotMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  message_type: 'text' | 'image' | 'file';
  attachment?: ChatbotAttachment;
  is_bot: boolean;
}

export interface ChatbotAttachment {
  id: string;
  url: string;
  type: 'image' | 'file';
  filename: string;
  mime_type: string;
  size: number;
  thumbnailUrl?: string;
}

export interface ChatbotConversation {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_message?: ChatbotMessage;
  title?: string;
}

// Response types for the chatbot API
export interface ChatbotMessageData {
  id: string;
  content: string;
  timestamp: string;
  is_bot: boolean;
  sender?: string | null;
  sender_name?: string | null;
}

export interface ChatbotResponse {
  user_message: ChatbotMessageData;
  bot_response: ChatbotMessageData;
}

export interface ChatbotConversationResponse {
  id: number;
  user: number;
  title: string;
  created_at: string;
  last_activity: string;
  is_active: boolean;
  last_message?: ChatbotMessageData;
  message_count: number;
  messages?: ChatbotMessageData[];
}

export interface ChatbotMessageRequest {
  content: string;
}

// Chatbot state types
export interface ChatbotUIState {
  isTyping: boolean;
  isExpanded: boolean;
  isMinimized: boolean;
  isFetchingHistory: boolean;
}

// Chatbot theme and styling types
export interface ChatbotTheme {
  primaryColor: string;
  secondaryColor: string;
  userBubbleColor: string;
  botBubbleColor: string;
  userTextColor: string;
  botTextColor: string;
  backgroundColor: string;
  typingIndicatorColor: string;
}

// Chatbot analytics event
export interface ChatbotEvent {
  eventType: 'message_sent' | 'message_received' | 'error' | 'session_started' | 'session_ended';
  timestamp: string;
  metadata?: Record<string, any>;
}
