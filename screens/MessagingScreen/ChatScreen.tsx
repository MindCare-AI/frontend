"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { MessageList } from "../../components/MessagingScreen/messages/MessageList"
import { ChatInput } from "../../components/MessagingScreen/messages/ChatInput"
import { Avatar } from "../../components/MessagingScreen/ui/Avatar"
import { useMessagesStore } from "../../store/messagesStore"
import type { ChatScreenRouteProp, ChatScreenNavigationProp } from "../../navigation/types"
import type { Message, Conversation } from "../../types/messaging/index"
import { ErrorBoundary } from "../../components/MessagingScreen/ErrorBoundary"
import { NetworkStatusBar } from "../../components/MessagingScreen/NetworkStatusBar"

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>()
  const navigation = useNavigation<ChatScreenNavigationProp>()
  const { id: conversationId } = route.params

  const {
    messages: allMessages,
    conversations,
    addMessage,
    updateMessage,
    deleteMessage,
    markConversationAsRead,
  } = useMessagesStore()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const messages = allMessages[conversationId] || []

  useEffect(() => {
    const currentConversation = conversations.find((c) => c.id === conversationId)
    if (currentConversation) {
      setConversation(currentConversation)
      markConversationAsRead(conversationId)
    }
    setIsLoading(false)
  }, [conversationId, conversations])

  const handleSendMessage = (message: Message) => {
    addMessage(message)
  }

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(conversationId, messageId)
  }

  const handleEditMessage = (messageId: string, newContent: string) => {
    updateMessage(conversationId, messageId, { content: newContent, edited: true })
  }

  const handleReactToMessage = (messageId: string, reaction: string) => {
    const message = messages.find((msg) => msg.id === messageId)
    if (!message) return

    const existingReactions = message.reactions || []
    const hasReacted = existingReactions.some((r) => r.userId === "current-user" && r.type === reaction)

    let updatedReactions = [...existingReactions]
    if (hasReacted) {
      updatedReactions = updatedReactions.filter((r) => !(r.userId === "current-user" && r.type === reaction))
    } else {
      updatedReactions.push({ userId: "current-user", type: reaction })
    }

    updateMessage(conversationId, messageId, { reactions: updatedReactions })
  }

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Conversation not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <NetworkStatusBar />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => navigation.navigate("Profile", { id: conversationId })}
          >
            <Avatar source={conversation.avatar} name={conversation.name} size={40} online={conversation.isOnline} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{conversation.name}</Text>
              <Text style={styles.profileStatus}>{conversation.isOnline ? "Online" : "Offline"}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="phone" size={22} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="video" size={22} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Search", { conversationId })}
            >
              <Feather name="search" size={22} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onDeleteMessage={handleDeleteMessage}
            onEditMessage={handleEditMessage}
            onReactToMessage={handleReactToMessage}
          />
        </View>

        <ChatInput conversationId={conversationId} onSendMessage={handleSendMessage} />
      </SafeAreaView>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  profileSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  profileInfo: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  profileStatus: {
    fontSize: 12,
    color: "#10B981",
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default ChatScreen
