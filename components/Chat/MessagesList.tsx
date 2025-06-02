import React, { useRef, useEffect } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import MessageBubble from './MessageBubble';
import ConversationLoadingScreen from '../common/ConversationLoadingScreen';

interface Message {
  id: string | number;
  content: string;
  sender_id: string | number;
  sender_name: string;
  timestamp: string;
  message_type: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  is_bot?: boolean;
}

interface MessagesListProps {
  messages: Message[];
  currentUserId: string | number;
  loading?: boolean;
  onRetryMessage?: (messageId: string | number) => void;
  isTyping?: boolean;
  isGroup?: boolean;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  currentUserId,
  loading = false,
  onRetryMessage,
  isTyping = false,
  isGroup = false,
}) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]); // scroll on any change, not just length

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    // Always ensure IDs are consistently handled as strings
    const senderId = item.sender_id?.toString() || '';
    const userId = currentUserId?.toString() || '';
    const previousMessage = index > 0 ? messages[index - 1] : null;
    
    // Ensure previous message ID is also stringified for comparison
    const previousSenderId = previousMessage?.sender_id?.toString() || '';
    
    // Determine whether to show sender name in group chats
    const showSenderName = Boolean(
      isGroup && 
      previousSenderId !== senderId &&
      senderId !== userId &&
      !item.is_bot
    );

    // Use explicit string comparison for consistent behavior
    const isOwnMessage = senderId === userId;

    console.log(`[MessagesList] Rendering message ${item.id}:`, {
      senderId,
      userId,
      isOwnMessage,
      showSenderName,
      messageContent: item.content.substring(0, 50)
    });

    return (
      <View key={`message-${item.id}`}>
        <MessageBubble
          message={item}
          currentUserId={currentUserId}
          onRetry={onRetryMessage}
          showSenderName={showSenderName}
        />
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>Typing</Text>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <ConversationLoadingScreen message="Loading messages..." />
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>Start a conversation!</Text>
      </View>
    );
  };

  const EmptyComponent = () => (
    <View>{renderEmptyState()}</View>
  );

  const FooterComponent = () => (
    <View>{renderTypingIndicator()}</View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messagesContainer,
          messages.length === 0 && styles.emptyMessagesContainer
        ]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }, 100);
        }}
        ListEmptyComponent={EmptyComponent}
        ListFooterComponent={FooterComponent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={20}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  messagesContainer: {
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyMessagesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  typingContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  typingBubble: {
    backgroundColor: '#E9E9EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    color: '#666666',
    fontSize: 14,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666666',
  },
  dot1: {},
  dot2: {},
  dot3: {},
});

export default MessagesList;
