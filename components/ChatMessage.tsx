import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot, timestamp }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        isBot ? styles.botContainer : styles.userContainer,
        { opacity: fadeAnim }
      ]}
    >
      {isBot && (
        <View style={styles.botIndicator}>
          <Text style={styles.botName}>Samantha</Text>
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
          {message}
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
  },
  botContainer: {
    alignSelf: 'flex-start',
  },
  botIndicator: {
    marginBottom: 4,
    paddingLeft: 12,
  },
  botName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#002D62',
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  message: {
    fontSize: 16,
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
    marginTop: 4,
    opacity: 0.8,
  },
  userTimestamp: {
    color: '#E0E0E0',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#666666',
    textAlign: 'left',
  },
});

export default ChatMessage;