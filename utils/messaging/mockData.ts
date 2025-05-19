import type { Conversation, Message, User, SearchResult } from "../types"

// Mock data for development
const mockConversations: Conversation[] = [
  {
    id: "conv1",
    name: "Dr. Sarah Johnson",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson",
    lastMessage: "See you at your next appointment on Friday at 2pm",
    lastActivity: "2023-08-24T14:15:22Z",
    unreadCount: 2,
    isGroup: false,
    isOnline: true,
  },
  {
    id: "conv2",
    name: "Anxiety Support Group",
    avatar: "https://ui-avatars.com/api/?name=Anxiety+Group",
    lastMessage: "John: Thanks everyone for sharing your experiences today",
    lastActivity: "2023-08-23T18:30:00Z",
    unreadCount: 0,
    isGroup: true,
    participantCount: 8,
    participants: [
      {
        id: "user1",
        name: "Dr. Sarah Johnson",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson",
        type: "Therapist",
      },
      { id: "user2", name: "John Smith", avatar: "https://ui-avatars.com/api/?name=John+Smith", type: "Patient" },
      { id: "user3", name: "Emily Parker", avatar: "https://ui-avatars.com/api/?name=Emily+Parker", type: "Therapist" },
      {
        id: "user4",
        name: "Dr. Michael Chen",
        avatar: "https://ui-avatars.com/api/?name=Michael+Chen",
        type: "Therapist",
      },
      {
        id: "user5",
        name: "Jessica Williams",
        avatar: "https://ui-avatars.com/api/?name=Jessica+Williams",
        type: "Patient",
      },
    ],
    moderators: ["user1", "user3"],
    description: "A safe space to discuss anxiety management techniques and support each other",
    isPrivate: false,
  },
  {
    id: "conv3",
    name: "Therapist Match",
    avatar: "https://ui-avatars.com/api/?name=Therapist+Match",
    lastMessage: "System: Your therapy match request has been processed",
    lastActivity: "2023-08-22T09:45:12Z",
    unreadCount: 1,
    isGroup: false,
  },
]

const mockUsers: User[] = [
  {
    id: "user1",
    name: "Dr. Sarah Johnson",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson",
    email: "dr.johnson@example.com",
    type: "Therapist",
    isOnline: true,
    specialization: "Anxiety & Depression",
  },
  {
    id: "user2",
    name: "John Smith",
    avatar: "https://ui-avatars.com/api/?name=John+Smith",
    email: "john.smith@example.com",
    type: "Patient",
    isOnline: false,
    lastActive: "2 hours ago",
  },
  {
    id: "user3",
    name: "Emily Parker",
    avatar: "https://ui-avatars.com/api/?name=Emily+Parker",
    email: "emily.parker@example.com",
    type: "Therapist",
    isOnline: false,
    lastActive: "1 day ago",
    specialization: "Cognitive Behavioral Therapy",
  },
]

const mockMessages: Record<string, Message[]> = {
  conv1: [
    {
      id: "msg1",
      conversationId: "conv1",
      senderId: "current-user",
      senderName: "You",
      content: "Hi Dr. Johnson, I wanted to follow up about our last session",
      timestamp: "2023-08-24T14:10:22Z",
      type: "text",
      read: true,
    },
    {
      id: "msg2",
      conversationId: "conv1",
      senderId: "user1",
      senderName: "Dr. Sarah Johnson",
      senderAvatar: "https://ui-avatars.com/api/?name=Sarah+Johnson",
      content: "Of course, what would you like to discuss?",
      timestamp: "2023-08-24T14:12:45Z",
      type: "text",
    },
    {
      id: "msg3",
      conversationId: "conv1",
      senderId: "current-user",
      senderName: "You",
      content: "I've been using the breathing technique you suggested and noticed some improvement",
      timestamp: "2023-08-24T14:13:30Z",
      type: "text",
      read: true,
    },
    {
      id: "msg4",
      conversationId: "conv1",
      senderId: "user1",
      senderName: "Dr. Sarah Johnson",
      senderAvatar: "https://ui-avatars.com/api/?name=Sarah+Johnson",
      content: "That's great to hear! How often have you been practicing it?",
      timestamp: "2023-08-24T14:15:22Z",
      type: "text",
    },
  ],
  conv2: [
    {
      id: "msg5",
      conversationId: "conv2",
      senderId: "system",
      senderName: "System",
      content: "Group created by Dr. Sarah Johnson",
      timestamp: "2023-08-20T10:00:00Z",
      type: "system",
    },
    {
      id: "msg6",
      conversationId: "conv2",
      senderId: "user1",
      senderName: "Dr. Sarah Johnson",
      senderAvatar: "https://ui-avatars.com/api/?name=Sarah+Johnson",
      content:
        "Welcome everyone to our anxiety support group. This is a safe space to share your experiences and support each other.",
      timestamp: "2023-08-20T10:05:22Z",
      type: "text",
    },
  ],
  conv3: [
    {
      id: "msg9",
      conversationId: "conv3",
      senderId: "system",
      senderName: "System",
      content: "Your therapy match request has been processed",
      timestamp: "2023-08-22T09:45:12Z",
      type: "system",
    },
    {
      id: "msg10",
      conversationId: "conv3",
      senderId: "user3",
      senderName: "Therapist Match",
      senderAvatar: "https://ui-avatars.com/api/?name=Therapist+Match",
      content: "Based on your preferences, we've matched you with Dr. Emily Parker who specializes in CBT.",
      timestamp: "2023-08-22T09:46:30Z",
      type: "text",
    },
  ],
}

// Data access functions
export function getConversations(): Conversation[] {
  return mockConversations
}

export function getConversationById(id: string): Conversation {
  return (
    mockConversations.find((conv) => conv.id === id) || {
      id,
      name: "Unknown Conversation",
      lastMessage: "",
      lastActivity: new Date().toISOString(),
      unreadCount: 0,
      isGroup: false,
    }
  )
}

export function getUsers(): User[] {
  return mockUsers
}

export function getUserById(id: string): User {
  return (
    mockUsers.find((user) => user.id === id) || {
      id,
      name: "Unknown User",
      isOnline: false,
    }
  )
}

export function getMessagesByConversationId(conversationId: string): Message[] {
  return mockMessages[conversationId] || []
}

export function searchMessagesData(query: string, conversationId?: string): SearchResult[] {
  const results: SearchResult[] = []

  Object.values(mockMessages).forEach((messages) => {
    if (conversationId && messages[0]?.conversationId !== conversationId) {
      return
    }

    messages.forEach((message) => {
      if (message.content.toLowerCase().includes(query.toLowerCase())) {
        const conversation = getConversationById(message.conversationId)

        results.push({
          messageId: message.id,
          conversationId: message.conversationId,
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
}
