"use client"

import type React from "react"
import { useState } from "react"
import { View, FlatList, StyleSheet, Modal, Text, TouchableOpacity, Platform } from "react-native"
import { ConversationItem } from "./ConversationItem"
import type { Conversation } from "../../../types/messaging/index"
import { Button } from "../ui/Button"
import { Feather } from "@expo/vector-icons"
import { useResponsive } from "../../../hooks/MessagingScreen/useResponsive"

interface ConversationListProps {
  conversations: Conversation[]
  onSelectConversation: (conversationId: string) => void
  onDeleteConversation: (conversationId: string) => void
  onViewProfile: (userId: string) => void
  onViewMembers: (conversationId: string) => void
  isLoading?: boolean
  testID?: string
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
  onDeleteConversation,
  onViewProfile,
  onViewMembers,
  isLoading = false,
  testID,
}) => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { isSmallScreen } = useResponsive()

  const handlePress = (conversation: Conversation) => {
    onSelectConversation(conversation.id)
  }

  const handleLongPress = (conversation: Conversation) => {
    setActiveConversation(conversation)
    setShowDialog(true)
  }

  const handleSwipeLeft = (conversation: Conversation) => {
    setActiveConversation(conversation)
    setShowDialog(true)
  }

  const handleDelete = () => {
    if (activeConversation) {
      onDeleteConversation(activeConversation.id)
      setShowDialog(false)
    }
  }

  const handleViewProfile = () => {
    if (activeConversation && !activeConversation.isGroup) {
      onViewProfile(activeConversation.id)
      setShowDialog(false)
    }
  }

  const handleViewMembers = () => {
    if (activeConversation && activeConversation.isGroup) {
      onViewMembers(activeConversation.id)
      setShowDialog(false)
    }
  }

  const renderItem = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onSwipeLeft={Platform.OS !== "web" ? handleSwipeLeft : undefined}
      testID={`conversation-item-${item.id}`}
    />
  )

  const keyExtractor = (item: Conversation) => item.id

  const renderSeparator = () => <View style={styles.separator} />

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No conversations yet</Text>
    </View>
  )

  return (
    <View style={styles.container} testID={testID}>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={conversations.length === 0 ? { flex: 1 } : undefined}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={Platform.OS !== "web"}
        getItemLayout={(data, index) => ({
          length: 80, // Approximate height of each item
          offset: 80 * index,
          index,
        })}
        testID="conversation-list"
      />

      <Modal
        visible={showDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
        supportedOrientations={["portrait", "landscape"]}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDialog(false)}>
          <View style={[styles.modalContent, isSmallScreen ? styles.modalContentSmall : null]}>
            <Text style={styles.modalTitle}>{activeConversation?.name}</Text>

            {activeConversation?.isGroup ? (
              <>
                <Button
                  title="View Members"
                  onPress={handleViewMembers}
                  variant="outline"
                  icon={<Feather name="users" size={18} color="#3B82F6" />}
                  style={styles.modalButton}
                  accessibilityLabel="View group members"
                />
                <Button
                  title="Delete"
                  onPress={handleDelete}
                  variant="outline"
                  icon={<Feather name="trash-2" size={18} color="#3B82F6" />}
                  style={styles.modalButton}
                  accessibilityLabel="Delete conversation"
                />
                <Button
                  title="Leave Group"
                  onPress={() => {
                    // Handle leave group
                    setShowDialog(false)
                  }}
                  variant="outline"
                  icon={<Feather name="log-out" size={18} color="#3B82F6" />}
                  style={styles.modalButton}
                  accessibilityLabel="Leave group"
                />
              </>
            ) : (
              <>
                <Button
                  title="View Profile"
                  onPress={handleViewProfile}
                  variant="outline"
                  icon={<Feather name="user" size={18} color="#3B82F6" />}
                  style={styles.modalButton}
                  accessibilityLabel="View profile"
                />
                <Button
                  title="Delete"
                  onPress={handleDelete}
                  variant="outline"
                  icon={<Feather name="trash-2" size={18} color="#3B82F6" />}
                  style={styles.modalButton}
                  accessibilityLabel="Delete conversation"
                />
              </>
            )}

            <Button
              title="Cancel"
              onPress={() => setShowDialog(false)}
              variant="ghost"
              style={styles.cancelButton}
              accessibilityLabel="Cancel"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 78,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "stretch",
  },
  modalContentSmall: {
    width: "90%",
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
})
