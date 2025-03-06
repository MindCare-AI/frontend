import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MessageItemProps {
  sender: string;
  content: string;
  timestamp: string;
  isUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ sender, content, timestamp, isUser }) => {
  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.otherMessage]}>
      <Text style={styles.sender}>{sender}</Text>
      <Text style={styles.content}>{content}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
  },
  sender: {
    fontWeight: 'bold',
  },
  content: {
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
  },
});

export default MessageItem;