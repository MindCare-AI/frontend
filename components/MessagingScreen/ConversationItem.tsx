//screens/MessagingScreen/components/ConversationItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Avatar } from "../ui/avatar"; 
import { formatTime } from '../../utils/helpers';

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
        style={[
          styles.container,
          hasUnread && styles.unreadContainer
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        delayPressIn={0}
      >
        <View style={styles.avatarWrapper}>
          <Avatar 
            size="md"
            nativeSource={
              !isGroup && conversation.otherParticipant?.avatar 
                ? { uri: conversation.otherParticipant.avatar } 
                : undefined
            }
            fallback={avatarInitial}
            style={styles.avatar} 
          />
          {isGroup && (
            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>G</Text>
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text 
              style={[
                styles.name,
                hasUnread && styles.unreadName
              ]} 
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text style={styles.time}>{formatTime(conversation.timestamp)}</Text>
          </View>
          
          <View style={styles.previewRow}>
            <Text 
              style={[
                styles.lastMessage,
                hasUnread && styles.unreadMessage
              ]} 
              numberOfLines={1}
            >
              {conversation.lastMessage}
            </Text>
            
            {hasUnread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      },
    }),
  },
  unreadContainer: {
    backgroundColor: '#F0F7FF',
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  groupBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  groupBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  unreadName: {
    fontWeight: '700',
    color: '#000000',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: '#333333',
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: '#888888',
  },
  badge: {
    backgroundColor: '#007BFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ConversationItem;