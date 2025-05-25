import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatbotMessage } from '../../types/chatbot';

interface ChatMessageBubbleProps {
  message: ChatbotMessage;
  onRetry?: (messageId: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onRetry,
}) => {
  const [pressScale] = useState(new Animated.Value(1));
  const isBot = message.is_bot;
  const isUser = !isBot;
  const isFailed = message.status === 'failed';
  const isSending = message.status === 'sending';

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleRetry = () => {
    if (onRetry && isFailed) {
      onRetry(message.id.toString());
    }
  };

  return (
    <View style={[
      styles.messageContainer,
      isUser ? styles.userContainer : styles.botContainer,
    ]}>
      {isBot && (
        <View style={styles.botAvatarContainer}>
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
        </View>
      )}
      
      <Animated.View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
          isFailed && styles.failedBubble,
          { transform: [{ scale: pressScale }] },
        ]}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
      >
        <Text style={[
          styles.messageText,
          isUser ? styles.userText : styles.botText,
          isFailed && styles.failedText,
        ]}>
          {message.content}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.botTimestamp,
          ]}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
          
          {isUser && (
            <View style={styles.statusContainer}>
              {isSending && (
                <Ionicons 
                  name="time-outline" 
                  size={14} 
                  color="#FFFFFF" 
                  style={styles.statusIcon}
                />
              )}
              {message.status === 'sent' && (
                <Ionicons 
                  name="checkmark" 
                  size={14} 
                  color="#FFFFFF" 
                  style={styles.statusIcon}
                />
              )}
              {isFailed && (
                <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                  <Ionicons 
                    name="refresh" 
                    size={14} 
                    color="#FF6B6B" 
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Animated.View>
      
      {isUser && (
        <View style={styles.userAvatarContainer}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>👤</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  botAvatarContainer: {
    marginRight: 12,
    marginBottom: 4,
  },
  userAvatarContainer: {
    marginLeft: 12,
    marginBottom: 4,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E4F0F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#002D62',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#002D62',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  botAvatarText: {
    fontSize: 18,
  },
  userAvatarText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderColor: '#E4F0F6',
    borderWidth: 1.5,
  },
  userBubble: {
    backgroundColor: '#002D62',
    borderBottomRightRadius: 6,
  },
  failedBubble: {
    backgroundColor: '#FFE6E6',
    borderColor: '#FF6B6B',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 6,
  },
  botText: {
    color: '#333333',
  },
  userText: {
    color: '#FFFFFF',
  },
  failedText: {
    color: '#D32F2F',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  botTimestamp: {
    color: '#666666',
  },
  userTimestamp: {
    color: '#FFFFFF',
  },
  statusContainer: {
    marginLeft: 8,
  },
  statusIcon: {
    opacity: 0.8,
  },
  retryButton: {
    padding: 2,
  },
});