"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { FlatList, StyleSheet, View, ActivityIndicator, Text, TouchableOpacity, Platform } from "react-native"
import { MessageItem } from "./MessageItem"
import type { Message } from "../../../types/messaging/index"
import { Feather } from "@expo/vector-icons"
import { useResponsive } from "../../../hooks/MessagingScreen/useResponsive"

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  listContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  scrollButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    padding: 10,
  },
  scrollButtonSmall: {
    padding: 5,
  },
})

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  onDeleteMessage: (messageId: string) => void
  onEditMessage: (messageId: string, newContent: string) => void
  onReactToMessage: (messageId: string, reaction: string) => void
  testID?: string
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onDeleteMessage,
  onEditMessage,
  onReactToMessage,
  testID,
}) => {
  const flatListRef = useRef<FlatList>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [newMessageCount, setNewMessageCount] = useState(0)
  const prevMessagesLengthRef = useRef(0)
  const { isSmallScreen } = useResponsive()

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const newCount = messages.length - prevMessagesLengthRef.current
      setNewMessageCount((prev) => prev + newCount)

      // Auto-scroll to bottom for new messages if already at bottom
      if (!showScrollButton) {
        scrollToBottom()
      }
    }

    prevMessagesLengthRef.current = messages.length
  }, [messages.length, showScrollButton])

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true })
      setNewMessageCount(0)
      setShowScrollButton(false)
    }
  }

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const paddingToBottom = 20
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom

    if (isCloseToBottom) {
      setShowScrollButton(false)
      setNewMessageCount(0)
    } else {
      setShowScrollButton(true)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID={`${testID}-loading`}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    )
  }

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={`${testID}-empty`}>
        <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
      </View>
    )
  }

  return (
    <View style={styles.container} testID={testID}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageItem
            message={item}
            isOwnMessage={item.senderId === "current-user"}
            onDelete={onDeleteMessage}
            onEdit={onEditMessage}
            onReact={onReactToMessage}
            testID={`message-${item.id}`}
          />
        )}
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        inverted={false}
        onContentSizeChange={() => {
          if (messages.length > 0 && prevMessagesLengthRef.current === 0) {
            scrollToBottom()
          }
        }}
        removeClippedSubviews={Platform.OS !== "web"}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
        getItemLayout={(data, index) => ({
          length: 80, // Approximate height of each item
          offset: 80 * index,
          index,
        })}
        testID="message-list"
      />

      {showScrollButton && (
        <TouchableOpacity
          style={[styles.scrollButton, isSmallScreen ? styles.scrollButtonSmall : null]}
          onPress={scrollToBottom}
          accessibilityLabel="Scroll to bottom"
          accessibilityRole="button"
        >
          <Feather name="chevron-down" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  )
}
