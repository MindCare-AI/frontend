import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import NewConversationModal from './NewConversationModal';
import MessageItem from '../MessagingScreen/MessageItem';

// Define type aliases for conversation items
export type Conversation = OneToOneConversation | GroupConversation;

interface OneToOneConversation {
  id: number | string;
  participants: Array<{ id: number; username: string }>;
  created_at: string;
  is_active: boolean;
  last_message?: {
    content: string;
    timestamp: string;
    sender: string;
  };
  unread_count?: number;
  other_participant?: string;
}

interface GroupConversation {
  id: number | string;
  name: string;
  description: string;
  participants: number[];
  moderators: number[];
  is_private: boolean;
  created_at: string;
  last_message?: {
    content: string;
    timestamp: string;
    sender: string;
  };
  unread_count?: number;
  participant_count?: number;
}

type ConversationType = 'one_to_one' | 'group';

type MessagingScreenNavigationProp = StackNavigationProp<MessagingStackParamList, 'Messaging'>;

const MessagingScreen: React.FC = () => {
  const navigation = useNavigation<MessagingScreenNavigationProp>();
  const { accessToken, user } = useAuth();
  const flatListRef = React.useRef<FlatList>(null);
  const [conversationType, setConversationType] = useState<ConversationType>('one_to_one');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [newConversationModalVisible, setNewConversationModalVisible] = useState(false);

  useEffect(() => {
    console.log('Auth State:', { 
      hasToken: !!accessToken, 
      hasUser: !!user,
      userDetails: user 
    });
  }, [accessToken, user]);

  useFocusEffect(
    useCallback(() => {
      if (accessToken) handleRefresh();
      return () => {};
    }, [accessToken, conversationType])
  );
  
  const fetchConversations = useCallback(async (pageNum = 1, refreshing = false) => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    if (pageNum === 1 && !refreshing) setIsLoading(true);
    if (refreshing) setIsRefreshing(true);
    setError(null);

    let endpoint = '';
    if (conversationType === 'one_to_one') {
      endpoint = `${API_URL}/messaging/one_to_one/?page=${pageNum}&page_size=20`;
    } else {
      endpoint = `${API_URL}/messaging/groups/?page=${pageNum}&page_size=20`;
    }
    
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }
      
      const data = await response.json();
      const hasMore = data.next !== null;
      setHasMoreConversations(hasMore);
      
      let results: Conversation[] = [];
      if (data.results && Array.isArray(data.results)) {
        results = data.results;
      } else if (Array.isArray(data)) {
        results = data;
      }
      
      if (pageNum === 1) {
        setConversations(results);
      } else {
        setConversations(prev => [...prev, ...results]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      if (pageNum === 1) {
        setConversations([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken, conversationType]);

  useEffect(() => {
    setPage(1);
    if (accessToken) {
      fetchConversations(1);
    } else {
      setIsLoading(false);
    }
  }, [fetchConversations, accessToken, conversationType]);

  const handleRefresh = () => {
    setPage(1);
    fetchConversations(1, true);
  };

  const handleLoadMore = () => {
    if (hasMoreConversations && !isLoading && !isRefreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchConversations(nextPage);
    }
  };

  const renderConversationItem = useCallback(({ item }: { item: Conversation }) => {
    let displayName = '';
    let lastMessageText = '';
    let lastMessageTime = '';
    let avatarUrl = '';
    
    try {
      if (conversationType === 'one_to_one') {
        const conv = item as OneToOneConversation;
        // First try to get the name from other_participant
        if (conv.other_participant) {
          displayName = conv.other_participant;
        } else {
          // If other_participant is not available, find the other user from participants array
          const userId = user?.id;
          const otherParticipant = conv.participants.find(p => p.id !== Number(userId));
          displayName = otherParticipant ? otherParticipant.username : 'Unknown User';
        }
        
        // Format last message and time
        if (conv.last_message) {
          lastMessageText = conv.last_message.content;
          lastMessageTime = new Date(conv.last_message.timestamp).toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit'
          });
        } else {
          lastMessageTime = new Date(conv.created_at).toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit'
          });
        }
        
        // Generate avatar URL using the display name
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
        
      } else {
        // Group conversation handling remains the same
        const conv = item as GroupConversation;
        displayName = conv.name || 'Group Chat';
        
        if (conv.last_message) {
          const sender = conv.last_message.sender;
          lastMessageText = sender ? `${sender}: ${conv.last_message.content}` : conv.last_message.content;
          lastMessageTime = new Date(conv.last_message.timestamp).toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit'
          });
        } else {
          lastMessageTime = new Date(conv.created_at).toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit'
          });
        }
        
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
      }
    } catch (err) {
      console.error('Error parsing conversation:', err);
      displayName = 'Error displaying user';
    }
  
    return (
      <TouchableOpacity 
        style={[
          styles.conversationItem,
          item.unread_count && item.unread_count > 0 ? styles.unreadConversation : null
        ]}
        onPress={() => {
          navigation.navigate('Chat', {
            conversationId: item.id,
            conversationType: conversationType,
            title: displayName
          });
        }}
      >
        <Image 
          source={{ uri: avatarUrl || 'https://ui-avatars.com/api/?name=User&background=random' }} 
          style={styles.avatar} 
        />
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationTitle}>{displayName}</Text>
            <Text style={styles.conversationTime}>{lastMessageTime}</Text>
          </View>
          
          {lastMessageText ? (
            <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
              {lastMessageText}
            </Text>
          ) : (
            <Text style={styles.noMessages}>No messages yet</Text>
          )}
        </View>
        
        {item.unread_count && item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {item.unread_count > 99 ? '99+' : item.unread_count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [conversationType, navigation, user]);
  
  // Use renderConversationItem for the conversations list.
  if (!accessToken) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Authentication required.</Text>
      </View>
    );
  }
  
  if (isLoading && page === 1) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            conversationType === 'one_to_one' && styles.activeToggle,
          ]}
          onPress={() => setConversationType('one_to_one')}
        >
          <Text style={[
            styles.toggleText,
            conversationType === 'one_to_one' ? styles.activeToggleText : styles.inactiveToggleText
          ]}>Direct Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            conversationType === 'group' && styles.activeToggle,
          ]}
          onPress={() => setConversationType('group')}
        >
          <Text style={[
            styles.toggleText,
            conversationType === 'group' ? styles.activeToggleText : styles.inactiveToggleText
          ]}>Group Chats</Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        ref={flatListRef}
        data={conversations}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.messageList}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#007BFF"]}
          />
        }
        ListFooterComponent={
          hasMoreConversations && isLoading && page > 1 ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#007BFF" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubText}>
                {conversationType === 'one_to_one'
                  ? 'Start chatting with someone!'
                  : 'Create or join a group chat!'}
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setNewConversationModalVisible(true)}
              >
                <Text style={styles.emptyButtonText}>
                  {conversationType === 'one_to_one'
                    ? 'Start a Conversation'
                    : 'Create a Group'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
      
      <TouchableOpacity
        style={styles.newConversationButton}
        onPress={() => setNewConversationModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
      
      <NewConversationModal
        visible={newConversationModalVisible}
        onClose={() => setNewConversationModalVisible(false)}
        conversationType={conversationType}
        onCreate={() => {
          setNewConversationModalVisible(false);
          handleRefresh();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  unreadConversation: {
    backgroundColor: '#F0F7FF',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F5',
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: '#007BFF',
  },
  toggleText: {
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  inactiveToggleText: {
    color: '#555',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
  },
  conversationTime: {
    fontSize: 12,
    color: '#70757A',
  },
  lastMessage: {
    fontSize: 14,
    color: '#5F6368',
    marginRight: 30,
  },
  noMessages: {
    fontSize: 14,
    color: '#9AA0A6',
    fontStyle: 'italic',
  },
  unreadBadge: {
    position: 'absolute',
    right: 15,
    backgroundColor: '#007BFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#5F6368',
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9AA0A6',
    marginTop: 10,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D93025',
    textAlign: 'center',
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
  },
  loadingMore: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  newConversationButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Add this style for the FlatList container if needed
  messageList: {
    paddingVertical: 10,
  },
});

export default MessagingScreen;
