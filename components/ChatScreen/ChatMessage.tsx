import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { format } from 'date-fns';
import { Image } from 'react-native';

interface ChatMessageProps {
  message: string | { content: string; [key: string]: any };
  isBot: boolean;
  timestamp: Date;
  avatar?: string;
  botName?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isBot, 
  timestamp,
  avatar,
  botName = 'Samantha' 
}) => {
  // Animation refs 
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(isBot ? -20 : 20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Sequence of animations for a more natural feel
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(translateXAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  }, []);

  // Ensure we render a string for the message
  const displayMessage =
    typeof message === 'object' && message !== null
      ? message.content
        ? message.content
        : JSON.stringify(message)
      : message;

  const defaultBotAvatar = require('../../assets/images/bot-avatar.png');

  return (
    <Animated.View
      style={[
        styles.container,
        isBot ? styles.botContainer : styles.userContainer,
        { 
          opacity: fadeAnim,
          transform: [
            { translateX: translateXAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      {isBot && (
        <View style={styles.botHeader}>
          <Image 
            source={avatar ? { uri: avatar } : defaultBotAvatar} 
            style={styles.botAvatar}
          />
          <View style={styles.botIndicator}>
            <Text style={styles.botName}>{botName}</Text>
          </View>
        </View>
      )}
      
      <View style={[
        styles.bubble,
        isBot ? styles.botBubble : styles.userBubble
      ]}>
        <Text style={[
          styles.message,
          isBot ? styles.botMessage : styles.userMessage
        ]}>
          {displayMessage}
        </Text>
        
        <Text style={[
          styles.timestamp,
          isBot ? styles.botTimestamp : styles.userTimestamp
        ]}>
          {format(timestamp, 'HH:mm')}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  botContainer: {
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  botHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 45, 98, 0.1)',
  },
  botIndicator: {
    justifyContent: 'center',
  },
  botName: {
    fontSize: 13,
    color: '#002D62',
    fontWeight: '600',
  },
  bubble: {
    padding: 14,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  userBubble: {
    backgroundColor: '#002D62',
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessage: {
    color: '#FFFFFF',
  },
  botMessage: {
    color: '#333333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botTimestamp: {
    color: '#666666',
  },
});

export default ChatMessage;