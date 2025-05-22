import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

// Types for the component props
export interface Participant {
  id: string | number;
  full_name?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
}

export interface Message {
  id: string | number;
  content: string;
  timestamp: string;
  sender_id: string | number;
  sender_name?: string;
  is_read: boolean;
}

export interface Conversation {
  id: string | number;
  is_group: boolean;
  name?: string;
  participants: Participant[];
  last_message?: Message;
  unread_count: number;
  other_user_name?: string;
  other_participant?: {
    id: string | number;
    username: string;
    user_type: string;
    profile_pic?: string;
  };
  other_participants?: Participant[];
}

export interface ConversationItemProps {
  conversation: Conversation;
  userId: string | number;
  onPress: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  userId, 
  onPress 
}) => {
  // Animation ref
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    // Start animation when component mounts
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 300,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  // For direct messages, get the name of the user we're talking to
  let displayName = '';
  
  if (conversation.is_group) {
    // For groups, use the group name
    displayName = conversation.name || 'Group Chat';
  } else {
    // For direct messages, use the other user's name with preference order
    if (conversation.other_user_name) {
      // Use the other_user_name field directly from API
      displayName = conversation.other_user_name;
    } else if (conversation.other_participant?.username) {
      // Use the username from other_participant object
      displayName = conversation.other_participant.username;
    } else if (conversation.other_participants && conversation.other_participants.length > 0) {
      // Try to find name in other_participants array
      const otherPerson = conversation.other_participants[0];
      if (otherPerson.first_name && otherPerson.last_name) {
        displayName = `${otherPerson.first_name} ${otherPerson.last_name}`.trim();
      } else if (otherPerson.full_name) {
        displayName = otherPerson.full_name;
      } else if (otherPerson.username) {
        displayName = otherPerson.username;
      } else {
        // Fallback to old method of finding by ID
        const otherParticipant = conversation.participants.find(p => p.id !== userId);
        displayName = otherParticipant?.full_name || 
                     otherParticipant?.username || 
                     'Unknown User';
      }
    } else {
      // Fallback to old method of finding by ID
      const otherParticipant = conversation.participants.find(p => p.id !== userId);
      displayName = otherParticipant?.full_name || 
                   otherParticipant?.username || 
                   'Unknown User';
    }
  }
  
  // Get profile image - updated to use optional chaining for all property paths
  const profileImage = conversation.is_group 
    ? null
    : conversation.other_participant?.profile_pic 
      ? { uri: conversation.other_participant.profile_pic }
      : conversation.other_participants && conversation.other_participants.length > 0 && 
        conversation.other_participants[0].profile_pic
        ? { uri: conversation.other_participants[0].profile_pic }
        : require('../../assets/default-avatar.png');
  
  // Format the timestamp
  const formattedTime = conversation.last_message?.timestamp 
    ? formatDistanceToNow(new Date(conversation.last_message.timestamp), { addSuffix: true })
    : '';
  
  // Get the last message content (truncate if too long)
  const messagePreview = conversation.last_message?.content
    ? conversation.last_message.content.length > 40
      ? conversation.last_message.content.substring(0, 37) + '...'
      : conversation.last_message.content
    : 'No messages yet';
  
  // Check if there are unread messages
  const hasUnread = conversation.unread_count > 0;

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }]
      }}
    >
      <TouchableOpacity 
        style={[
          styles.container, 
          hasUnread && styles.unreadContainer,
          conversation.is_group ? styles.groupContainer : styles.directContainer
        ]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {profileImage ? (
            <Image source={profileImage} style={styles.avatar} />
          ) : (
            // Render a group icon if no group avatar image
            <View style={[
              styles.avatar, 
              { 
                backgroundColor: '#E4F0F6', 
                justifyContent: 'center', 
                alignItems: 'center'
              }
            ]}>
              <Ionicons name="people" size={32} color="#002D62" />
            </View>
          )}
          {conversation.is_group && (
            <View style={styles.badgeIcon}>
              <Ionicons name="people" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[
              styles.name, 
              hasUnread && styles.unreadText,
              conversation.is_group && styles.groupName
            ]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.time}>{formattedTime}</Text>
          </View>
          
          <View style={styles.previewRow}>
            <Text style={[styles.preview, hasUnread && styles.unreadText]} numberOfLines={1}>
              {conversation.is_group && conversation.last_message?.sender_id !== userId ? (
                <Text style={styles.senderPrefix}>
                  {conversation.last_message?.sender_name?.split(' ')[0] || 'Someone'}: 
                </Text>
              ) : null}
              {messagePreview}
            </Text>
            
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  directContainer: {
    borderLeftColor: '#3498db',
    borderLeftWidth: 3,
  },
  groupContainer: {
    borderLeftColor: '#9b59b6',
    borderLeftWidth: 3,
  },
  unreadContainer: {
    backgroundColor: '#F0F7FF',
    shadowColor: '#002D62',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
  },
  badgeIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9b59b6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  groupName: {
    color: '#9b59b6',
  },
  unreadText: {
    fontWeight: '700',
    color: '#002D62',
  },
  time: {
    fontSize: 12,
    color: '#888888',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    marginRight: 8,
  },
  senderPrefix: {
    fontWeight: '600',
    color: '#555',
  },
  unreadBadge: {
    backgroundColor: '#002D62',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ConversationItem;
