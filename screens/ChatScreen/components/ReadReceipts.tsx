// screens/ChatScreen/components/ReadReceipts.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface ReadReceiptsProps {
  readBy: Array<{
    id: string;
    name: string;
    read_at: string;
  }>;
  isUserMessage: boolean;
}

const ReadReceipts: React.FC<ReadReceiptsProps> = ({ readBy, isUserMessage }) => {
  if (!readBy || readBy.length === 0) return null;

  return (
    <View style={[styles.container, isUserMessage ? styles.userReceipts : styles.otherReceipts]}>
      {readBy.length > 0 && (
        <View style={styles.readContainer}>
          <Icon 
            name="checkmark-done" 
            size={14} 
            color={isUserMessage ? '#E0E0E0' : '#666'} 
            style={styles.icon}
          />
          <Text style={[styles.readText, isUserMessage ? styles.userReadText : styles.otherReadText]}>
            {readBy.length > 1 ? `Read by ${readBy.length}` : 'Read'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userReceipts: {
    justifyContent: 'flex-end',
  },
  otherReceipts: {
    justifyContent: 'flex-start',
  },
  readContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  readText: {
    fontSize: 10,
  },
  userReadText: {
    color: '#E0E0E0',
  },
  otherReadText: {
    color: '#666',
  },
});

export default ReadReceipts;