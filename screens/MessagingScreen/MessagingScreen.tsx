//screens/MessagingScreen/MessagingScreen.tsx
import React from 'react';
import { View, StyleSheet, SectionList, Text, Alert, StatusBar } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator'; // Adjust path as needed
import useConversations from '../../hooks/MessagingScreen/useConversations';
import ConversationItem from '../../components/MessagingScreen/ConversationItem';
import SearchBar from '../../components/MessagingScreen/SearchBar';
import NewChatButton from '../../components/MessagingScreen/NewChatButton';
import { LoadingIndicator, ErrorMessage } from '../../components/ui';
import { API_URL } from '../../config'; // Ensure correct API_URL
import { useAuth } from '../../contexts/AuthContext';
import TypingIndicator from '../../components/ChatScreen/TypingIndicator';

type MessagingScreenNavigationProp = StackNavigationProp<MessagingStackParamList, 'Messaging'>;

interface Props {
  navigation: MessagingScreenNavigationProp;
}

interface TypingIndicatorProps {
  visible: boolean;
  conversationId: string;
}

const MessagingScreen: React.FC<Props> = ({ navigation }) => {
  const { accessToken } = useAuth();
  const { conversations, loading, error, searchQuery, handleSearch, loadMore, refresh, typingIndicators } = useConversations();

  const createNewConversation = async () => {
    try {
      const response = await fetch(`${API_URL}/messaging/one_to_one/`, {
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
      <StatusBar backgroundColor="#007BFF" barStyle="light-content" />
      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      
      {error && <ErrorMessage message="Failed to load conversations" onRetry={refresh} />}
      
      {loading && conversations.length === 0 ? (
        <LoadingIndicator />
      ) : (
        <SectionList
          sections={[
            { 
              title: 'Direct Messages', 
              data: conversations.filter(c => c.conversation_type === 'one_to_one') 
            },
            { 
              title: 'Group Chats', 
              data: conversations.filter(c => c.conversation_type === 'group') 
            }
          ]}
          renderItem={({ item }) => (
            <ConversationItem 
              conversation={{
                ...item,
                lastMessage: item.lastMessage || '',
                timestamp: item.timestamp || '',
                unreadCount: item.unreadCount ?? 0,
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
          stickySectionHeadersEnabled={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>Start a new chat to begin messaging</Text>
            </View>
          }
        />
      )}
      
      {typingIndicators && (
        <TypingIndicator 
          visible={typingIndicators.length > 0} 
          conversationId={conversations[0]?.id || ''} 
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
    backgroundColor: '#F5F7FA', // Lighter, modern background color
  },
  listContent: {
    padding: 12,
    paddingBottom: 80, // Extra padding at bottom for FAB
  },
  sectionHeader: {
    backgroundColor: 'rgba(245, 247, 250, 0.95)', // Semi-transparent background
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9EEF6',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667892', // More subdued color for section headers
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A4B66',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#667892',
    textAlign: 'center',
    lineHeight: 20,
  }
});

export default MessagingScreen;
