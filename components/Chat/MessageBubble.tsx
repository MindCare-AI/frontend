import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string | number;
  content: string;
  sender_id: string | number;
  sender_name: string;
  timestamp: string;
  message_type: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  is_bot?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  currentUserId: string | number;
  onRetry?: (messageId: string | number) => void;
  showSenderName?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
  onRetry,
  showSenderName = false,
}) => {
  const isOwnMessage = message.sender_id?.toString() === currentUserId?.toString();
  const isBot = message.is_bot || false;

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color="#999999" />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color="#999999" />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={12} color="#999999" />;
      case 'read':
        return <Ionicons name="checkmark-done" size={12} color="#007AFF" />;
      case 'failed':
        return <Ionicons name="alert-circle" size={12} color="#FF3B30" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      {showSenderName && !isOwnMessage && (
        <Text style={styles.senderName}>{message.sender_name}</Text>
      )}
      
      <View style={[
        styles.bubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble,
        isBot && styles.botBubble
      ]}>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {message.content}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>
            {formatTime(message.timestamp)}
          </Text>
          
          {isOwnMessage && (
            <View style={styles.statusContainer}>
              {getStatusIcon()}
            </View>
          )}
          
          {message.status === 'failed' && onRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => onRetry(message.id)}
            >
              <Ionicons name="refresh" size={14} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 16,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    marginLeft: 12,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },
  botBubble: {
    backgroundColor: '#F0F0F0',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999999',
    marginRight: 4,
  },
  statusContainer: {
    marginLeft: 4,
  },
  retryButton: {
    marginLeft: 8,
    padding: 2,
  },
});

export default MessageBubble;
