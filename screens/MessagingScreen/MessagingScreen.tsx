//screens/MessagingScreen/MessagingScreen.tsx
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator'; // Adjust path as needed
import useConversations from './hooks/useConversations';
import ConversationItem from './components/ConversationItem';
import SearchBar from './components/SearchBar';
import NewChatButton from './components/NewChatButton';
import { LoadingIndicator, ErrorMessage } from '../../components/ui';
import { Conversation } from '../../types/chat';

type MessagingScreenNavigationProp = StackNavigationProp<MessagingStackParamList, 'Messaging'>;

interface Props {
  navigation: MessagingScreenNavigationProp;
}

const MessagingScreen: React.FC<Props> = ({ navigation }) => {
  const { conversations, loading, error, searchQuery, handleSearch, loadMore, refresh } = useConversations();

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const normalizedConversation = {
      ...item,
      lastMessage: item.lastMessage ?? 'No messages yet',
      timestamp: item.timestamp ?? new Date().toISOString(),
      unreadCount: item.unreadCount ?? 0,
    };

    return (
      <ConversationItem
        conversation={normalizedConversation}
        onPress={() => {
          navigation.navigate('Chat', {
            conversationId: String(item.id),
            conversationType: item.conversation_type as 'one_to_one' | 'group',
            title: item.name || item.otherParticipant?.name || 'Chat',
          });
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      {error && <ErrorMessage message="Failed to load conversations" onRetry={refresh} />}
      {loading && conversations.length === 0 ? (
        <LoadingIndicator />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMore}
          onRefresh={refresh}
          refreshing={loading}
          contentContainerStyle={styles.listContent}
        />
      )}
      <NewChatButton
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: '',
            conversationType: 'one_to_one',
            title: 'New Chat',
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  listContent: {
    padding: 16,
  },
});

export default MessagingScreen;
