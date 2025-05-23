import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createShadow } from '../../styles/global';

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
  const isBot = message.is_bot;
  
  console.log(`[MessageBubble] Rendering message:`, {
    messageId: message.id,
    senderId: message.sender_id,
    currentUserId,
    isOwnMessage,
    isBot,
    content: message.content?.substring(0, 50)
  });

  const getMessageTime = () => {
    const date = new Date(message.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    if (!isOwnMessage) return null;
    
    switch (message.status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color="#999" />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color="#999" />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={12} color="#999" />;
      case 'read':
        return <Ionicons name="checkmark-done" size={12} color="#4CAF50" />;
      case 'failed':
        return <Ionicons name="alert-circle" size={12} color="#F44336" />;
      default:
        return null;
    }
  };

  const getBubbleStyle = () => {
    if (isBot) {
      return [styles.messageBubble, styles.botBubble];
    } else if (isOwnMessage) {
      return [styles.messageBubble, styles.ownMessageBubble];
    } else {
      return [styles.messageBubble, styles.otherMessageBubble];
    }
  };

  const getTextStyle = () => {
    if (isBot) {
      return styles.botMessageText;
    } else if (isOwnMessage) {
      return styles.ownMessageText;
    } else {
      return styles.otherMessageText;
    }
  };

  const getContainerStyle = () => {
    if (isOwnMessage) {
      return [styles.messageContainer, styles.ownMessageContainer];
    } else {
      return [styles.messageContainer, styles.otherMessageContainer];
    }
  };

  return (
    <View style={getContainerStyle()}>
      {!isOwnMessage && !isBot && showSenderName && (
        <Text style={styles.senderName}>{message.sender_name}</Text>
      )}
      
      {isBot && (
        <View style={styles.botIndicator}>
          <Ionicons name="chatbox" size={12} color="#6B73FF" />
          <Text style={styles.botLabel}>AI Assistant</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={getBubbleStyle()}
        onPress={message.status === 'failed' ? () => onRetry?.(message.id) : undefined}
        disabled={message.status !== 'failed'}
      >
        <Text style={getTextStyle()}>
          {message.content}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>
            {getMessageTime()}
          </Text>
          {getStatusIcon()}
        </View>
        
        {message.status === 'failed' && (
          <View style={styles.failedIndicator}>
            <Text style={styles.failedText}>Tap to retry</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 2,
    marginHorizontal: 16,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '100%',
    ...createShadow(2, '#000', 0.1),
  },
  ownMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },
  botBubble: {
    backgroundColor: '#F0F0FF',
    borderWidth: 1,
    borderColor: '#6B73FF',
    borderBottomLeftRadius: 4,
  },
  ownMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  otherMessageText: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 22,
  },
  botMessageText: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#999999',
    opacity: 0.8,
  },
  senderName: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
    marginLeft: 4,
    fontWeight: '500',
  },
  botIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  botLabel: {
    fontSize: 11,
    color: '#6B73FF',
    fontWeight: '600',
  },
  failedIndicator: {
    marginTop: 4,
    alignItems: 'center',
  },
  failedText: {
    fontSize: 11,
    color: '#F44336',
    fontStyle: 'italic',
  },
});

export default MessageBubble;
