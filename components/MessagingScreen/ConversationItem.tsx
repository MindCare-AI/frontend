//screens/MessagingScreen/components/ConversationItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

// Enhanced avatar handling and improved styling
const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onPress }) => {
  const displayName = conversation.name || (conversation.otherParticipant?.name) || "Chat";
  const avatarInitial = (displayName.charAt(0) || "").toUpperCase();

  const isGroup = conversation.isGroup === true;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8} // Improved visual feedback
    >
      <Avatar 
        nativeSource={
          !isGroup && conversation.otherParticipant?.avatar 
            ? { uri: conversation.otherParticipant.avatar } 
            : undefined
        }
        fallback={avatarInitial}
        style={styles.avatar} 
      />
      <View style={styles.content}>
        <Text style={styles.name}>{displayName}</Text>
        <Text 
          style={styles.lastMessage}
          numberOfLines={1}
        >
          {conversation.lastMessage}
        </Text>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.time}>{formatTime(conversation.timestamp)}</Text>
        {conversation.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    backgroundColor: 'white',
    borderRadius: 8, // Added rounded corners
    marginVertical: 4, // Added spacing between items
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333', // Improved text color
  },
  lastMessage: {
    fontSize: 14,
    color: '#777',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 5,
  },
});

export default ConversationItem;