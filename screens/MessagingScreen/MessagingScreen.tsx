//screens/MessagingScreen/MessagingScreen.tsx
import React from 'react';
import { View, StyleSheet, SectionList, Text, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator'; // Adjust path as needed
import useConversations from './hooks/useConversations';
import ConversationItem from './components/ConversationItem';
import SearchBar from './components/SearchBar';
import NewChatButton from './components/NewChatButton';
import { LoadingIndicator, ErrorMessage } from '../../components/ui';
import { API_URL } from '../../config'; // Ensure correct API_URL
import { useAuth } from '../../contexts/AuthContext';

type MessagingScreenNavigationProp = StackNavigationProp<MessagingStackParamList, 'Messaging'>;

interface Props {
  navigation: MessagingScreenNavigationProp;
}

const MessagingScreen: React.FC<Props> = ({ navigation }) => {
  const { accessToken } = useAuth();
  const { conversations, loading, error, searchQuery, handleSearch, loadMore, refresh } = useConversations();

  const createNewConversation = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/messaging/one_to_one/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      const data = await response.json();
      return data.id.toString();
    } catch (error) {
      console.error('Create conversation error:', error);
      Alert.alert('Error', 'Could not create conversation');
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      {error && <ErrorMessage message="Failed to load conversations" onRetry={refresh} />}
      {loading && conversations.length === 0 ? (
        <LoadingIndicator />
      ) : (
        <SectionList
          sections={[
            { title: 'Direct Messages', data: conversations.filter(c => c.conversation_type === 'one_to_one') },
            { title: 'Group Chats', data: conversations.filter(c => c.conversation_type === 'group') }
          ]}
          renderItem={({ item }) => (
            <ConversationItem 
              conversation={{
                ...item,
                lastMessage: item.lastMessage || '', // now guaranteed to be string
                timestamp: item.timestamp || '',     // default to empty string if undefined
                unreadCount: item.unreadCount ?? 0,      // default if needed
              }}
              onPress={() => navigation.navigate('Chat', {
                conversationId: String(item.id),
                conversationType: (item.conversation_type === 'direct' || item.conversation_type === 'chatbot')
                  ? 'one_to_one'
                  : item.conversation_type,
                title: item.name || item.otherParticipant?.name || 'Chat',
              })}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMore}
          onRefresh={refresh}
          refreshing={loading}
          contentContainerStyle={styles.listContent}
        />
      )}
      <NewChatButton
        onPress={async () => {
          const newId = await createNewConversation();
          if (newId) {
            navigation.navigate('Chat', {
              conversationId: newId,
              conversationType: 'one_to_one',
              title: 'New Chat',
            });
          }
        }}
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
  sectionHeader: {
    backgroundColor: '#f4f4f4',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MessagingScreen;
