import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ReadReceipt } from '../../types/chat';

interface ReadReceiptsProps {
  readReceipts: ReadReceipt[];
  messageId: string;
  timestamp: string;
}

export const ReadReceipts: React.FC<ReadReceiptsProps> = ({
  readReceipts,
  messageId,
  timestamp,
}) => {
  const messageReaders = readReceipts.filter(
    receipt => receipt.message_id === messageId
  );

  if (messageReaders.length === 0) return null;

  return (
    <View style={styles.container}>
      {messageReaders.map((reader) => (
        <View key={reader.user_id} style={styles.avatarContainer}>
          <Image
            source={{ uri: reader.avatar_url }}
            style={styles.avatar}
          />
          <Text style={styles.readTime}>
            {formatReadTime(reader.timestamp, timestamp)}
          </Text>
        </View>
      ))}
    </View>
  );
};

const formatReadTime = (readTime: string, messageTime: string) => {
  const read = new Date(readTime);
  const sent = new Date(messageTime);
  const diff = read.getTime() - sent.getTime();
  
  if (diff < 60000) { // less than 1 minute
    return 'Just now';
  }
  
  if (diff < 3600000) { // less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m`;
  }
  
  if (diff < 86400000) { // less than 1 day
    const hours = Math.floor(diff / 3600000);
    return `${hours}h`;
  }
  
  return read.toLocaleDateString();
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginRight: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginLeft: 4,
  },
  avatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 1,
  },
  readTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});

export default ReadReceipts;