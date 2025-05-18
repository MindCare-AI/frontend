import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Conversation } from '../../types/messaging';
import { globalStyles } from '../../styles/global';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const {
    last_message,
    unread_count,
  } = conversation;

  const getLastMessagePreview = () => {
    if (!last_message) return '';

    if (last_message.message_type === 'text') {
      return last_message.content;
    }

    if (last_message.message_type === 'image') {
      return '📷 Photo';
    }

    if (last_message.message_type === 'file') {
      return '📎 File';
    }

    return '';
  };

  const getFormattedTime = () => {
    if (!last_message?.timestamp) return '';
    return formatDistanceToNow(new Date(last_message.timestamp), { addSuffix: true });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        unread_count > 0 && styles.unreadContainer,
      ]}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        {conversation.participants.some(p => p.avatar) ? (
          <Image
            source={{ uri: conversation.participants.find(p => p.avatar)?.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {conversation.otherParticipant?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {conversation.participants.some(p => p.online) && (
          <View style={styles.onlineIndicator} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text 
            style={[
              styles.name,
              unread_count > 0 && styles.unreadText,
            ]}
            numberOfLines={1}
          >
            {conversation.otherParticipant?.name}
          </Text>
          <Text style={styles.time}>{getFormattedTime()}</Text>
        </View>

        <View style={styles.previewContainer}>
          <Text 
            style={[
              styles.preview,
              unread_count > 0 && styles.unreadText,
            ]}
            numberOfLines={1}
          >
            {getLastMessagePreview()}
          </Text>
          {unread_count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unread_count > 99 ? '99+' : unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  unreadContainer: {
    backgroundColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: globalStyles.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    color: '#000',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: globalStyles.colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});