// Core message types for chatbot
export interface ChatbotMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  timestamp: string;
  message_type: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  is_bot?: boolean;
}

export interface ChatbotConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatbotMessageData {
  id: string | number;
  content: string;
  timestamp: string;
  is_bot: boolean;
}

export interface ChatbotResponse {
  id: string | number;
  title?: string;
  messages?: ChatbotMessageData[];
  user_message?: {
    id: string;
    content: string;
    timestamp: string;
  };
  bot_response?: {
    id: string;
    content: string;
    timestamp: string;
  };
}

export interface CreateChatbotConversationResponse {
  id: string | number;
  title: string;
  messages: ChatbotMessageData[];
}

export interface SendChatbotMessageResponse {
  user_message: {
    id: string;
    content: string;
    timestamp: string;
  };
  bot_response: {
    id: string;
    content: string;
    timestamp: string;
  };
}
