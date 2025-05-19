"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Animated,
  PanResponder,
  Image,
  Platform,
} from "react-native"
import { formatDistanceToNow } from "date-fns"
import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"
import { Feather } from "@expo/vector-icons"
import type { Message } from "../../../types/messaging/index"
import { useResponsive } from "../../../hooks/MessagingScreen/useResponsive"

interface MessageItemProps {
  message: Message
  isOwnMessage: boolean
  onDelete: (messageId: string) => void
  onEdit: (messageId: string, newContent: string) => void
  onReact: (messageId: string, reaction: string) => void
  testID?: string
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
  onDelete,
  onEdit,
  onReact,
  testID,
}) => {
  const [showOptions, setShowOptions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)
  const [showReactions, setShowReactions] = useState(false)
  const { isSmallScreen } = useResponsive()

  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pan = useRef(new Animated.ValueXY()).current

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current)
      }
      pan.stopAnimation()
    }
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => Platform.OS !== "web", // Disable on web
      onPanResponderGrant: () => {
        longPressTimeout.current = setTimeout(() => {
          setShowOptions(true)
        }, 600)
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10) {
          if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current)
            longPressTimeout.current = null
          }
        }
      },
      onPanResponderRelease: () => {
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current)
          longPressTimeout.current = null
        }
      },
    }),
  ).current

  const handleSaveEdit = () => {
    if (editedContent.trim() !== message.content) {
      onEdit(message.id, editedContent)
    }
    setIsEditing(false)
  }

  const handleReaction = (reaction: string) => {
    onReact(message.id, reaction)
    setShowReactions(false)
    setShowOptions(false)
  }

  // For web, use click instead of long press
  const handleWebClick = () => {
    if (Platform.OS === "web") {
      setShowOptions(true)
    }
  }

  if (message.type === "system") {
    return (
      <View style={styles.systemContainer} testID={testID}>
        <Text style={styles.systemText}>{message.content}</Text>
      </View>
    )
  }

  return (
    <View
      style={[styles.container, isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer]}
      testID={testID}
    >
      {!isOwnMessage && (
        <View style={styles.avatarContainer}>
          <Avatar source={message.senderAvatar} name={message.senderName} size={36} />
        </View>
      )}

      <View style={[styles.bubbleContainer, isOwnMessage ? styles.ownBubbleContainer : styles.otherBubbleContainer]}>
        {!isOwnMessage && <Text style={styles.senderName}>{message.senderName}</Text>}

        <Pressable
          style={[
            styles.bubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
            Platform.OS === "web" ? styles.webBubble : null,
          ]}
          {...(Platform.OS !== "web" ? panResponder.panHandlers : {})}
          onLongPress={() => setShowOptions(true)}
          onPress={Platform.OS === "web" ? handleWebClick : undefined}
          accessibilityLabel={`Message from ${message.senderName}: ${message.content}`}
          accessibilityRole="text"
        >
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editedContent}
                onChangeText={setEditedContent}
                multiline
                autoFocus
                accessibilityLabel="Edit message"
              />
              <View style={styles.editButtons}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setIsEditing(false)
                    setEditedContent(message.content)
                  }}
                  variant="ghost"
                  size="sm"
                  accessibilityLabel="Cancel editing"
                />
                <Button title="Save" onPress={handleSaveEdit} size="sm" accessibilityLabel="Save edited message" />
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.messageText, isOwnMessage ? styles.ownMessageText : styles.otherMessageText]}>
                {message.content}
              </Text>
              {message.media && (
                <View style={styles.mediaContainer}>
                  <Image
                    source={{ uri: message.media }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                    accessibilityLabel="Message attachment"
                  />
                </View>
              )}

              {message.reactions && message.reactions.length > 0 && (
                <View style={styles.reactionsContainer}>
                  {message.reactions.map((reaction, index) => (
                    <View key={index} style={styles.reactionBadge}>
                      <Text>{reaction.type}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </Pressable>

        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</Text>
          {isOwnMessage && <Text style={styles.status}>{message.read ? "Read" : "Delivered"}</Text>}
          {message.edited && <Text style={styles.edited}>(edited)</Text>}
        </View>
      </View>

      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
        supportedOrientations={["portrait", "landscape"]}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowOptions(false)}>
          <View style={[styles.modalContent, isSmallScreen ? styles.modalContentSmall : null]}>
            <Text style={styles.modalTitle}>Message Options</Text>

            <TouchableOpacity style={styles.reactionSelector} onPress={() => setShowReactions(!showReactions)}>
              <Text style={styles.reactionTitle}>React with:</Text>
              <View style={styles.reactionGrid}>
                {["👍", "❤️", "😂", "😮"].map((reaction) => (
                  <TouchableOpacity
                    key={reaction}
                    style={styles.reactionButton}
                    onPress={() => handleReaction(reaction)}
                    accessibilityLabel={`React with ${reaction}`}
                  >
                    <Text style={styles.reactionEmoji}>{reaction}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>

            <Button
              title="Reply"
              onPress={() => {
                // Handle reply
                setShowOptions(false)
              }}
              variant="outline"
              icon={<Feather name="corner-up-left" size={18} color="#3B82F6" />}
              style={styles.modalButton}
              accessibilityLabel="Reply to message"
            />

            <Button
              title="Forward"
              onPress={() => {
                // Handle forward
                setShowOptions(false)
              }}
              variant="outline"
              icon={<Feather name="corner-up-right" size={18} color="#3B82F6" />}
              style={styles.modalButton}
              accessibilityLabel="Forward message"
            />

            <Button
              title="Copy"
              onPress={() => {
                // Handle copy
                setShowOptions(false)
              }}
              variant="outline"
              icon={<Feather name="copy" size={18} color="#3B82F6" />}
              style={styles.modalButton}
              accessibilityLabel="Copy message"
            />

            {isOwnMessage && (
              <>
                <Button
                  title="Edit"
                  onPress={() => {
                    setIsEditing(true)
                    setShowOptions(false)
                  }}
                  variant="outline"
                  icon={<Feather name="edit-2" size={18} color="#3B82F6" />}
                  style={styles.modalButton}
                  accessibilityLabel="Edit message"
                />

                <Button
                  title="Delete"
                  onPress={() => {
                    onDelete(message.id)
                    setShowOptions(false)
                  }}
                  variant="outline"
                  icon={<Feather name="trash-2" size={18} color="#E11D48" />}
                  style={styles.modalButton}
                  textStyle={{ color: "#E11D48" }}
                  accessibilityLabel="Delete message"
                />
              </>
            )}

            <Button
              title="Cancel"
              onPress={() => setShowOptions(false)}
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
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  ownMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: "flex-end",
  },
  bubbleContainer: {
    maxWidth: "75%",
  },
  ownBubbleContainer: {
    alignItems: "flex-end",
  },
  otherBubbleContainer: {
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "100%",
  },
  webBubble: {
    cursor: "pointer",
  },
  ownBubble: {
    backgroundColor: "#3B82F6",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: "white",
  },
  otherMessageText: {
    color: "black",
  },
  messageFooter: {
    flexDirection: "row",
    marginTop: 4,
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginRight: 4,
  },
  status: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  edited: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  systemContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  systemText: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  reactionSelector: {
    marginBottom: 16,
  },
  reactionTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  reactionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  reactionButton: {
    width: "23%",
    aspectRatio: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  modalButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginTop: 8,
  },
  editContainer: {
    width: "100%",
  },
  editInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    minHeight: 80,
    textAlignVertical: "top",
    color: "black",
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  mediaContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  mediaImage: {
    width: "100%",
    height: 150,
  },
  reactionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  reactionBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
})
