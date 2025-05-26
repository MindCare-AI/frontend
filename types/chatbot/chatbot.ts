// types/chatbot/chatbot.ts

export interface User {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  sender: number | null;
  sender_name: string;
  is_bot: boolean;
  timestamp: string;
  message_type: 'text' | 'system' | 'error';
  metadata?: Record<string, any>;
  parent_message?: number | null;
  chatbot_method?: string | null;
}

export interface LastMessage {
  id: number;
  content: string;
  is_bot: boolean;
  timestamp: string;
  sender_name: string;
}

export interface ConversationSummary {
  id: string;
  conversation_id: string;
  user: number;
  start_message: number | null;
  end_message: number | null;
  created_at: string;
  summary_text: string;
  key_points: string[];
  emotional_context: Record<string, any>;
  message_count: number;
  metadata?: Record<string, any>;
}

export interface ChatbotConversation {
  id: number;
  user: number;
  title: string;
  created_at: string;
  last_activity: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  last_message?: LastMessage | null;
  message_count: number;
  latest_summary?: ConversationSummary | null;
  recent_messages: ChatMessage[];
  messages?: ChatMessage[]; // Full messages array from API response
  last_message_at: string;
  participants: number[];
}

export interface ChatbotConversationListItem {
  id: number;
  title: string;
  created_at: string;
  last_activity: string;
  is_active: boolean;
  message_count: number;
  last_message_preview?: {
    preview: string;
    is_bot: boolean;
    timestamp: string;
  } | null;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface SendMessageResponse {
  user_message: ChatMessage;
  bot_response: ChatMessage;
}

export interface SendMessageRequest {
  content: string;
}

export interface CreateConversationRequest {
  title?: string;
  metadata?: Record<string, any>;
}

export interface UpdateConversationRequest {
  title?: string;
  metadata?: Record<string, any>;
  is_active?: boolean;
}

export interface ToggleActiveRequest {
  is_active?: boolean;
}

export interface SystemInfo {
  using_gpu_service: boolean;
  service_type: string;
  rag_info: {
    service_name: string;
    vector_store_type: string;
    document_count?: number;
    chunk_count?: number;
    db_error?: string;
    error?: string;
  };
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Query parameters for API calls
export interface ConversationListParams {
  time_filter?: '24h' | '7d' | '30d';
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface MessagesParams {
  limit?: number;
  offset?: number;
}

// UI State types
export interface ChatbotState {
  conversations: (ChatbotConversation | ChatbotConversationListItem)[];
  currentConversation: ChatbotConversation | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendingMessage: boolean;
  loadingMessages: boolean;
  hasMoreMessages: boolean;
  systemInfo: SystemInfo | null;
}

export interface ChatbotActions {
  // Conversation management
  fetchConversations: (params?: ConversationListParams) => Promise<void>;
  createConversation: (data?: CreateConversationRequest) => Promise<ChatbotConversation | null>;
  updateConversation: (id: number, data: UpdateConversationRequest) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  toggleConversationActive: (id: number, isActive?: boolean) => Promise<void>;
  clearConversation: (id: number) => Promise<void>;
  
  // Message management
  fetchMessages: (conversationId: number, params?: MessagesParams) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<void>;
  loadMoreMessages: (conversationId: number) => Promise<void>;
  
  // UI state management
  setCurrentConversation: (conversation: ChatbotConversation | null) => void;
  clearError: () => void;
  
  // System info
  fetchSystemInfo: () => Promise<void>;
}

export type ChatbotContextType = ChatbotState & ChatbotActions;

// Error types
export interface ChatbotError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Navigation types
export interface ChatbotNavigationParams {
  conversationId?: number;
  autoCreate?: boolean;
}
