// Chatbot related type definitions
import { MessageType, MessageAttachment, MessageReaction } from './messaging';

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
}

export interface MessageRequest {
  content: string;
  conversation_id: string;
  message_type: MessageType;
  attachment?: MessageAttachment;
}

export interface ChatbotConversation {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  title?: string;
}

export interface ChatbotState {
  currentConversation: ChatbotConversation | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
}