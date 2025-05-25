// Core message types for chatbot
export interface ChatbotMessage {
  id: string | number;
  content: string;
  sender?: number | null;
  sender_name?: string | null;
  timestamp: string;
  message_type: string;
  is_bot: boolean;
  metadata?: any;
  parent_message?: number | null;
  chatbot_method?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ChatbotConversation {
  id: string | number;
  user: number;
  title: string;
  created_at: string;
  last_activity: string;
  is_active: boolean;
  last_message?: ChatbotMessage | null;
  message_count: number;
  latest_summary?: string | null;
  last_message_at: string;
  participants: any[];
  recent_messages: ChatbotMessage[];
}

export interface ChatbotMessageData {
  id: string | number;
  content: string;
  timestamp: string;
  is_bot: boolean;
  sender?: number | null;
  sender_name?: string | null;
  message_type?: string;
  metadata?: any;
  parent_message?: number | null;
  chatbot_method?: string;
}

export interface ChatbotResponse {
  id: string | number;
  title?: string;
  messages?: ChatbotMessageData[];
  user_message?: {
    id: string | number;
    content: string;
    timestamp: string;
    sender?: number | null;
    sender_name?: string | null;
    is_bot: boolean;
    message_type: string;
    metadata?: any;
    parent_message?: number | null;
    chatbot_method?: string;
  };
  bot_response?: {
    id: string | number;
    content: string;
    timestamp: string;
    sender?: number | null;
    sender_name?: string | null;
    is_bot: boolean;
    message_type: string;
    metadata?: any;
    parent_message?: number | null;
    chatbot_method?: string;
  };
}

export interface CreateChatbotConversationResponse {
  id: string | number;
  user: number;
  title: string;
  created_at: string;
  last_activity: string;
  is_active: boolean;
  last_message?: ChatbotMessage | null;
  message_count: number;
  latest_summary?: string | null;
  last_message_at: string;
  participants: any[];
  recent_messages: ChatbotMessage[];
}

export interface SendChatbotMessageResponse {
  id: string | number;
  conversation_id: string | number;
  user_message?: ChatbotMessage;
  bot_response?: ChatbotMessage;
  timestamp: string;
}

export interface ChatbotConversationListResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: ChatbotConversation[];
}
