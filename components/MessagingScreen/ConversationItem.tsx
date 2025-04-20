//screens/MessagingScreen/components/ConversationItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Avatar } from "../ui/avatar"; 
import { formatTime } from '../../utils/helpers';
import { globalStyles } from '../../styles/global';
// Define interface for component props
interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

interface ConversationItemProps {
  conversation: {
    id: string;
    otherParticipant?: Participant; // Make optional
    name?: string; // Add name directly for group chats
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    isGroup?: boolean; // Add to distinguish between group and individual chats
  };
  onPress: () => void;
}

// Enhanced avatar handling, animations and improved styling
const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onPress }) => {
  const displayName = conversation.name || (conversation.otherParticipant?.name) || "Chat";
  const avatarInitial = (displayName.charAt(0) || "").toUpperCase();
  const isGroup = conversation.isGroup === true;
  
  const [pressed, setPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Entry animation
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, []);
  
  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true
    }).start();
  };

  const hasUnread = conversation.unreadCount > 0;

  return (
    <Animated.View style={{
      opacity: opacityAnim,
      transform: [{ scale: scaleAnim }]
    }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            padding: globalStyles.spacing.md,
            backgroundColor: globalStyles.colors.white,
            borderRadius: globalStyles.spacing.md,
            marginVertical: globalStyles.spacing.xxs,
            shadowColor: globalStyles.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            ...(hasUnread
              ? {
                  backgroundColor: globalStyles.colors.infoLight,
                  borderLeftWidth: 4,
                  borderLeftColor: globalStyles.colors.info,
                }
              : {}),
          }}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          delayPressIn={0}>
          <View style={{ position: 'relative', marginRight: globalStyles.spacing.md }}>
            <Avatar
              size="md"
              nativeSource={
                !isGroup && conversation.otherParticipant?.avatar
                  ? { uri: conversation.otherParticipant.avatar }
                  : undefined
              }
              fallback={avatarInitial}
            />
            {isGroup && (
              <View
                style={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  backgroundColor: globalStyles.colors.success,
                  borderRadius: globalStyles.spacing.xs,
                  width: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: globalStyles.colors.white,
                }}>
                <Text style={{ ...globalStyles.bodyBold, fontSize: 10, color: globalStyles.colors.white }}>
                  G
                </Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: globalStyles.spacing.xxs }}>
              <Text
                style={{
                  ...globalStyles.subtitle,
                  color: hasUnread ? globalStyles.colors.textPrimary : globalStyles.colors.textSecondary,
                  flex: 1,
                  marginRight: globalStyles.spacing.xs,
                }}
                numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={{ ...globalStyles.caption, color: globalStyles.colors.textTertiary }}>
                {formatTime(conversation.timestamp)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text
                style={{
                  ...globalStyles.body,
                  color: hasUnread ? globalStyles.colors.textPrimary : globalStyles.colors.textTertiary,
                  flex: 1,
                  marginRight: globalStyles.spacing.xs,
                }}
                numberOfLines={1}>
                {conversation.lastMessage}
              </Text>

              {hasUnread && (
                <View
                  style={{
                    backgroundColor: globalStyles.colors.info,
                    borderRadius: globalStyles.spacing.md,
                    minWidth: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: globalStyles.spacing.xs,
                  }}>
                  <Text style={{ ...globalStyles.bodyBold, fontSize: 12, color: globalStyles.colors.white }}>
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  export default ConversationItem;