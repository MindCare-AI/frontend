import React, { memo } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { Message } from '../../types/chat';
import MessageBubble from './MessageBubble';
import { formatRelativeTime } from '../../utils/helpers';

interface MessageGroupProps {
  messages: Message[];
  isLastGroup: boolean;
  onMessagePress?: (message: Message) => void;
  onMessageLongPress?: (message: Message) => void;
  onReactionSelect?: (messageId: string, reaction: string) => void;
}

const MessageGroup: React.FC<MessageGroupProps> = ({
  messages,
  isLastGroup,
  onMessagePress,
  onMessageLongPress,
  onReactionSelect,
}) => {
  if (messages.length === 0) return null;

  const sender = messages[0].sender;
  const lastMessage = messages[messages.length - 1];
  const showAvatar = isLastGroup;

  return (
    <View style={styles.container}>
      {/* Sender info and timestamp */}
      <View style={styles.header}>
        {showAvatar && (
          <Image
            source={{ uri: sender.avatar }}
            style={styles.avatar}
            defaultSource={require('../../assets/images/default-avatar.png')}
          />
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.senderName}>{sender.name}</Text>
          <Text style={styles.timestamp}>
            {formatRelativeTime(lastMessage.timestamp)}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <View style={[styles.messages, showAvatar && styles.messagesWithAvatar]}>
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isFirstInGroup={index === 0}
            isLastInGroup={index === messages.length - 1}
            showAvatar={showAvatar && index === messages.length - 1}
            onPress={() => onMessagePress?.(message)}
            onLongPress={() => onMessageLongPress?.(message)}
            onReactionSelect={(reaction) => 
              onReactionSelect?.(message.id, reaction)
            }
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messages: {
    marginLeft: 12,
  },
  messagesWithAvatar: {
    marginLeft: 52,
  },
});

export default memo(MessageGroup);