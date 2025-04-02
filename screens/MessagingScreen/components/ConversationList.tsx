//screens/MessagingScreen/components/ConversationList.tsx
import React, { useCallback, memo } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import ConversationItem from './ConversationItem';

// Define interface for conversation
interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

interface Conversation {
  id: string;
  otherParticipant: Participant;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

// Define props interface for the component
interface ConversationListProps {
  conversations: Conversation[];
  onConversationPress: (conversation: Conversation) => void;
  onEndReached: () => void;
  refreshing: boolean;
  onRefresh: () => void;
}

const MemoizedConversationItem = memo(ConversationItem);

const EmptyList = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No conversations yet</Text>
    <Text style={styles.emptySubtext}>Start a new chat to begin messaging</Text>
  </View>
);

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  onConversationPress,
  onEndReached,
  refreshing,
  onRefresh 
}) => {
  const renderItem = useCallback(({ item }: { item: Conversation }) => (
    <MemoizedConversationItem 
      conversation={item} 
      onPress={() => onConversationPress(item)}
    />
  ), [onConversationPress]);

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  return (
    <FlatList
      data={conversations}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={EmptyList}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ConversationList;