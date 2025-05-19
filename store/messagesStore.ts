import { create } from "zustand"
import { getConversations, getMessagesByConversationId, getUsers } from "../utils/messaging/mockData"
import type { Conversation, Message, User, SearchResult } from "../types/messaging/index"

interface MessagesState {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  contacts: User[]
  currentUser: User
  error: string | null
  isLoading: boolean

  // Actions
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  deleteConversation: (id: string) => void

  addMessage: (message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (conversationId: string, messageId: string) => void

  markConversationAsRead: (conversationId: string) => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void

  // Search functionality
  searchMessages: (query: string, conversationId?: string) => SearchResult[]

  // Initialization
  initializeStore: () => void
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  conversations: [],
  messages: {},
  contacts: [],
  error: null,
  isLoading: false,
  currentUser: {
    id: "current-user",
    name: "You",
    avatar: "https://ui-avatars.com/api/?name=You",
    email: "you@example.com",
    isOnline: true,
  },

  addConversation: (conversation) => {
    try {
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        error: null,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  },

  updateConversation: (id, updates) => {
    try {
      set((state) => ({
        conversations: state.conversations.map((conv) => (conv.id === id ? { ...conv, ...updates } : conv)),
        error: null,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  },

  deleteConversation: (id) => {
    try {
      set((state) => ({
        conversations: state.conversations.filter((conv) => conv.id !== id),
        messages: Object.fromEntries(Object.entries(state.messages).filter(([convId]) => convId !== id)),
        error: null,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  },

  addMessage: (message) => {
    try {
      set((state) => {
        const conversationMessages = state.messages[message.conversationId] || []
        const updatedMessages = [...conversationMessages, message]

        // Update conversation last message and activity
        const conversation = state.conversations.find((c) => c.id === message.conversationId)

        if (conversation) {
          const isOwnMessage = message.senderId === "current-user"
          const updatedConversation = {
            ...conversation,
            lastMessage: isOwnMessage ? `You: ${message.content}` : `${message.senderName}: ${message.content}`,
            lastActivity: message.timestamp,
            unreadCount: isOwnMessage ? 0 : conversation.unreadCount + 1,
          }

          return {
            messages: {
              ...state.messages,
              [message.conversationId]: updatedMessages,
            },
            conversations: state.conversations.map((c) => (c.id === message.conversationId ? updatedConversation : c)),
            error: null,
          }
        }

        return {
          messages: {
            ...state.messages,
            [message.conversationId]: updatedMessages,
          },
          error: null,
        }
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  },

  updateMessage: (conversationId, messageId, updates) => {
    try {
      set((state) => {
        const conversationMessages = state.messages[conversationId] || []
        const updatedMessages = conversationMessages.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))

        return {
          messages: {
            ...state.messages,
            [conversationId]: updatedMessages,
          },
          error: null,
        }
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  },

  deleteMessage: (conversationId, messageId) => {
    try {
      set((state) => {
        const conversationMessages = state.messages[conversationId] || []
        const updatedMessages = conversationMessages.filter((msg) => msg.id !== messageId)

        return {
          messages: {
            ...state.messages,
            [conversationId]: updatedMessages,
          },
          error: null,
        }
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  },

  markConversationAsRead: (conversationId: string) => {
    try {
      set((state) => {
        // Find the conversation
        const conversation = state.conversations.find((c) => c.id === conversationId)

        // If conversation doesn't exist or already has 0 unread, no change needed
        if (!conversation || conversation.unreadCount === 0) {
          return state
        }

        // Update the conversation's unread count
        return {
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
          ),
          error: null,
        }
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  },

  setError: (error) => {
    set({ error })
  },

  setLoading: (isLoading) => {
    set({ isLoading })
  },

  searchMessages: (query: string, conversationId?: string) => {
    const { messages, conversations } = get()
    const results: SearchResult[] = []

    // Function to check if content matches query
    const matchesQuery = (content: string) => content.toLowerCase().includes(query.toLowerCase())

    // Loop through all conversations or just the specified one
    const convsToSearch = conversationId
      ? [conversations.find((c) => c.id === conversationId)].filter(Boolean) as Conversation[]
      : conversations

    convsToSearch.forEach((conversation) => {
      const conversationMessages = messages[conversation.id] || []

      conversationMessages.forEach((message) => {
        if (matchesQuery(message.content)) {
          results.push({
            messageId: message.id,
            conversationId: conversation.id,
            conversationName: conversation.name,
            conversationAvatar: conversation.avatar,
            senderName: message.senderName,
            content: message.content,
            timestamp: message.timestamp,
          })
        }
      })
    })

    return results
  },

  initializeStore: () => {
    try {
      set({ isLoading: true })
      const conversations = getConversations()
      const messages: Record<string, Message[]> = {}

      conversations.forEach((conversation) => {
        messages[conversation.id] = getMessagesByConversationId(conversation.id)
      })

      const contacts = getUsers()

      set({ conversations, messages, contacts, isLoading: false, error: null })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", isLoading: false })
    }
  },
}))
