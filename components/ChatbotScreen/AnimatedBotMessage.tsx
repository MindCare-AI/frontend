import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { ChatbotMessage } from '../../types/chatbot';

interface AnimatedBotMessageProps {
  message: ChatbotMessage;
  index: number;
}

export const AnimatedBotMessage: React.FC<AnimatedBotMessageProps> = ({ message, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Reset animations first
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    
    // Start animation with a small delay based on index
    const delay = Math.min(index * 100, 500); // Cap delay at 500ms
    
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [message.id]); // Only re-animate when message ID changes

  const isBot = message.is_bot;
  const isUser = !isBot;

  // Format timestamp consistently
  const formatTimestamp = (timestamp: string | Date) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isUser ? styles.userContainer : styles.botContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {isBot && (
        <View style={styles.botAvatarContainer}>
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.botBubble,
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userText : styles.botText,
        ]}>
          {message.content}
        </Text>
        
        <Text style={[
          styles.timestamp,
          isUser ? styles.userTimestamp : styles.botTimestamp,
        ]}>
          {formatTimestamp(message.timestamp)}
        </Text>
      </View>
      
      {isUser && (
        <View style={styles.userAvatarContainer}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>👤</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  botAvatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  userAvatarContainer: {
    marginLeft: 8,
    marginTop: 4,
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatarText: {
    fontSize: 14,
  },
  userAvatarText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 2,
  },
  botBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  botText: {
    color: '#111827',
  },
  userText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.6,
  },
  botTimestamp: {
    color: '#6B7280',
  },
  userTimestamp: {
    color: '#FFFFFF',
  },
});