import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AvatarSvg from '../../assets/avatar/avatar.svg';

interface MessageItemProps {
  id: string;
  content: string;
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  isCurrentUser: boolean;
  status?: 'sent' | 'delivered' | 'read';
  isEdited?: boolean;
  reactions?: string;
  onRetry?: () => void;
  onLongPress?: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  id,
  content, 
  sender, 
  timestamp, 
  isCurrentUser,
  status = 'sent',
  isEdited = false,
  reactions,
  onRetry,
  onLongPress
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false, // disable native animation driver for environments where it's not supported
    }).start();
  }, []);
  
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  let reactionsList: { emoji: string, count: number }[] = [];
  if (reactions) {
    if (typeof reactions === 'string') {
      try {
        reactionsList = JSON.parse(reactions);
      } catch (e) {
        console.error('Failed to parse reactions:', e);
      }
    } else if (typeof reactions === 'object') {
      reactionsList = reactions as { emoji: string, count: number }[];
    }
  }
  
  const hasFailed = !!onRetry;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={onLongPress}
        delayLongPress={500}
        style={[
          styles.container, 
          isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
        ]}
      >
        {!isCurrentUser && (
          sender.avatar ? (
            <Image 
              source={{ uri: sender.avatar }} 
              style={styles.avatar} 
            />
          ) : (
            <AvatarSvg width={36} height={36} />
          )
        )}
        
        <View style={[
          styles.messageContent,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
          hasFailed && styles.failedMessage
        ]}>
          {!isCurrentUser && (
            <Text style={styles.senderName}>{sender.name}</Text>
          )}
          
          <Text style={styles.messageText}>{content}</Text>
          
          <View style={styles.messageMeta}>
            {isEdited && (
              <Text style={styles.editedText}>(edited)</Text>
            )}
            
            <Text style={styles.timeText}>{formattedTime}</Text>
            
            {isCurrentUser && !hasFailed && (
              <Ionicons 
                name={
                  status === 'read' ? 'checkmark-done-outline' : 
                  status === 'delivered' ? 'checkmark-done-outline' : 'checkmark-outline'
                } 
                size={16} 
                color={status === 'read' ? '#4CAF50' : '#999'} 
                style={styles.statusIcon}
              />
            )}
            
            {hasFailed && (
              <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
                <Ionicons name="refresh-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
          
          {reactionsList.length > 0 && (
            <View style={styles.reactionsContainer}>
              {reactionsList.map((reaction, index) => (
                <View key={index} style={styles.reactionBubble}>
                  <Text>{reaction.emoji}</Text>
                  {reaction.count > 1 && (
                    <Text style={styles.reactionCount}>{reaction.count}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    maxWidth: '100%',
  },
  currentUserContainer: {
    justifyContent: 'flex-end',
  },
  otherUserContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  messageContent: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '75%',
  },
  currentUserMessage: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  failedMessage: {
    backgroundColor: '#FFE5E5',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E88E5',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#999999',
    marginRight: 4,
  },
  editedText: {
    fontSize: 11,
    color: '#999999',
    fontStyle: 'italic',
    marginRight: 4,
  },
  statusIcon: {
    marginLeft: 2,
  },
  retryButton: {
    marginLeft: 6,
    padding: 2,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  reactionBubble: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
    alignItems: 'center',
  },
  reactionCount: {
    fontSize: 12,
    marginLeft: 2,
    color: '#666',
  }
});

const MessageList: React.FC<{ messages: MessageItemProps[] }> = ({ messages }) => (
  <FlatList
    inverted
    data={messages}
    renderItem={({ item }) => <MessageItem {...item} />}
    // ...other props
  />
);

export default MessageItem;