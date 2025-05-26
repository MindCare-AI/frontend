import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedBotMessageProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: number;
    error?: boolean;
  };
  index: number;
}

export const AnimatedBotMessage: React.FC<AnimatedBotMessageProps> = ({ message, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        delay: index * 50,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        delay: index * 50,
      }),
    ]).start();
  }, [index]);

  const isBot = message.sender === 'bot';

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isBot ? styles.botContainer : styles.userContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      {isBot && (
        <View style={styles.botIconContainer}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#4B7BEC" />
        </View>
      )}
      <View style={[
        styles.messageBubble,
        isBot ? styles.botBubble : styles.userBubble,
        message.error && styles.errorBubble
      ]}>
        <Text style={[
          styles.messageText,
          isBot ? styles.botText : styles.userText,
          message.error && styles.errorText
        ]}>
          {message.text}
        </Text>
        {message.error && (
          <TouchableOpacity style={styles.retryButton}>
            <Ionicons name="refresh-outline" size={18} color="#FF6B6B" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
    maxWidth: '100%',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '85%',
  },
  botBubble: {
    backgroundColor: '#F0F5FF',
    borderBottomLeftRadius: 4,
    marginLeft: 8,
  },
  userBubble: {
    backgroundColor: '#4B7BEC',
    borderBottomRightRadius: 4,
  },
  errorBubble: {
    backgroundColor: '#FFEFEF',
    borderColor: '#FFCDD2',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: '#333333',
  },
  userText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#D32F2F',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  retryText: {
    color: '#FF6B6B',
    marginLeft: 4,
    fontSize: 14,
  },
  botIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
