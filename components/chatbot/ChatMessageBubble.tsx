import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface ChatMessageBubbleProps {
  message: string;
  isBot: boolean;
  timestamp: string;
  status?: 'sending' | 'sent' | 'failed';
  onRetry?: () => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isBot,
  timestamp,
  status = 'sent',
  onRetry,
}) => {
  const isFailed = status === 'failed';
  const isSending = status === 'sending';

  return (
    <View style={[
      styles.container,
      isBot ? styles.botContainer : styles.userContainer,
      isFailed && styles.failedContainer
    ]}>
      <View style={[
        styles.bubble,
        isBot ? styles.botBubble : styles.userBubble,
        isFailed && styles.failedBubble
      ]}>
        <Markdown style={isBot ? botMarkdownStyles : userMarkdownStyles}>
          {message}
        </Markdown>
        
        <View style={styles.footer}>
          <Text style={[
            styles.timestamp,
            isBot ? styles.botTimestamp : styles.userTimestamp
          ]}>
            {format(new Date(timestamp), 'HH:mm')}
          </Text>
          
          {!isBot && (
            <View style={styles.statusContainer}>
              {isSending && (
                <Ionicons name="time-outline" size={14} color="#666" />
              )}
              {isFailed && (
                <TouchableOpacity onPress={onRetry}>
                  <Ionicons name="refresh-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              )}
              {status === 'sent' && (
                <Ionicons name="checkmark-circle" size={14} color="#4CD964" />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  botContainer: {
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  failedContainer: {
    opacity: 0.8,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  botBubble: {
    backgroundColor: '#E8E8E8',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#002D62',
    borderBottomRightRadius: 4,
  },
  failedBubble: {
    backgroundColor: '#FFE5E5',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  botTimestamp: {
    color: '#666',
  },
  userTimestamp: {
    color: '#FFF',
  },
  statusContainer: {
    marginLeft: 8,
  },
});

const botMarkdownStyles = {
  body: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
};

const userMarkdownStyles = {
  body: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 22,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
};

export default ChatMessageBubble;