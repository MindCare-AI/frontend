"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableHighlight, Animated, PanResponder, Platform } from "react-native"
import { formatDistanceToNow } from "date-fns"
import { Avatar } from "../ui/Avatar"
import { Badge } from "../ui/Badge"
import type { Conversation } from "../../../types/messaging/index"
import { useResponsive } from "../../../hooks/MessagingScreen/useResponsive"

interface ConversationItemProps {
  conversation: Conversation
  onPress: (conversation: Conversation) => void
  onLongPress: (conversation: Conversation) => void
  onSwipeLeft?: (conversation: Conversation) => void
  testID?: string
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
  onLongPress,
  onSwipeLeft,
  testID,
}) => {
  const pan = useRef(new Animated.ValueXY()).current
  const swipeThreshold = -80
  const { isSmallScreen } = useResponsive()

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      pan.stopAnimation()
    }
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only enable swipe on mobile and when swiping horizontally
        return Platform.OS !== "web" && Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10
      },
      onPanResponderGrant: () => {
        // Use type assertion to access current values
        // This works around type checking issues while maintaining the same functionality
        const currentX = (pan.x as any)._value
        const currentY = (pan.y as any)._value

        pan.setOffset({
          x: currentX,
          y: currentY,
        })
        pan.setValue({ x: 0, y: 0 })
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset()
        if (gestureState.dx < swipeThreshold && onSwipeLeft) {
          onSwipeLeft(conversation)
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 5,
        }).start()
      },
    }),
  ).current

  const webStyles = Platform.OS === "web" ? { cursor: "pointer" as const } : {}

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: pan.x }] }, webStyles]}
      {...(Platform.OS !== "web" ? panResponder.panHandlers : {})}
      testID={testID}
    >
      <TouchableHighlight
        underlayColor="#f5f5f5"
        onPress={() => onPress(conversation)}
        onLongPress={() => onLongPress(conversation)}
        accessibilityRole="button"
        accessibilityLabel={`Conversation with ${conversation.name}, last message: ${conversation.lastMessage}`}
      >
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <Avatar
              source={conversation.avatar}
              name={conversation.name}
              size={isSmallScreen ? 40 : 50}
              online={conversation.isOnline}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {conversation.name}
              </Text>
              <Text style={styles.time}>
                {formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: true })}
              </Text>
            </View>
            <View style={styles.messageRow}>
              <Text style={styles.message} numberOfLines={1}>
                {conversation.lastMessage}
              </Text>
              {conversation.unreadCount > 0 && <Badge count={conversation.unreadCount} />}
            </View>
          </View>
        </View>
      </TouchableHighlight>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
  },
  content: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  message: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
})
