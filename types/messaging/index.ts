export interface Conversation {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  lastActivity: string
  unreadCount: number
  isGroup: boolean
  isOnline?: boolean
  participants?: User[]
  participantCount?: number
  description?: string
  isPrivate?: boolean
  moderators?: string[]
}

export interface User {
  id: string
  name: string
  avatar?: string
  email?: string
  type?: string
  isOnline?: boolean
  lastActive?: string
  specialization?: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  type: "text" | "media" | "system"
  media?: string
  read?: boolean
  edited?: boolean
  reactions?: Reaction[]
}

export interface Reaction {
  userId: string
  type: string
}

export interface SearchResult {
  messageId: string
  conversationId: string
  conversationName: string
  conversationAvatar?: string
  senderName: string
  content: string
  timestamp: string
}
