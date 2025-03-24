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

// Define your navigation parameters
type RootStackParamList = {
  Chat: {
    conversationId: number | string;
    conversationType: 'one_to_one' | 'group';
    title?: string;
  };
  // Add other screens here
};

type ConversationType = 'one_to_one' | 'group';

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

// Use this navigation type
type MessagingScreenNavigationProp = StackNavigationProp<MessagingStackParamList, 'Messaging'>;

const MessagingScreen: React.FC = () => {
  const navigation = useNavigation<MessagingScreenNavigationProp>();
  const { accessToken, user } = useAuth();
  const [conversationType, setConversationType] = useState<ConversationType>('one_to_one');
  const [conversations, setConversations] = useState<(OneToOneConversation | GroupConversation)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [newConversationModalVisible, setNewConversationModalVisible] = useState(false);

  // Add debug logging
  useEffect(() => {
    console.log('Auth State:', { 
      hasToken: !!accessToken, 
      hasUser: !!user,
      userDetails: user 
    });
  }, [accessToken, user]);

  // Refresh conversations when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (accessToken) {
        handleRefresh();
      }
      return () => {};
    }, [accessToken, conversationType])
  );
  
  // Update fetch conversations to use pagination and handle errors
  const fetchConversations = useCallback(async (pageNum = 1, refreshing = false) => {
    console.log('Attempting to fetch conversations:', {
      page: pageNum,
      refreshing,
      hasToken: !!accessToken,
      hasUser: !!user,
      userDetails: user
    });

    if (!accessToken) {
      console.error('Missing access token');
      setIsLoading(false);
      return;
    }

    // Set appropriate loading state
    if (pageNum === 1 && !refreshing) setIsLoading(true);
    if (refreshing) setIsRefreshing(true);
    
    // Reset error state
    setError(null);

    let endpoint = '';
    if (conversationType === 'one_to_one') {
      endpoint = `${API_URL}/messaging/one_to_one/?page=${pageNum}&page_size=20`;
    } else {
      endpoint = `${API_URL}/messaging/groups/?page=${pageNum}&page_size=20`;
    }
    
    try {
      console.log('Fetching from endpoint:', endpoint);
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
      console.log('Received API response:', data);
      
      // Determine if there are more pages
      const hasMore = data.next !== null;
      setHasMoreConversations(hasMore);
      
      // Extract results, ensuring it's always an array
      let results = [];
      if (data.results && Array.isArray(data.results)) {
        // Handle paginated response
        console.log('Setting paginated conversations:', data.results.length);
        results = data.results;
      } else if (Array.isArray(data)) {
        // Handle array response
        console.log('Setting array conversations:', data.length);
        results = data;
      } else {
        // Handle unexpected response format
        console.error('Unexpected API response format:', data);
        results = []; // Set empty array to avoid mapping errors
      }
      
      // Update state based on pagination
      if (pageNum === 1) {
        setConversations(results);
      } else {
        setConversations(prev => [...prev, ...results]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      if (pageNum === 1) {
        setConversations([]); // Set empty array on error for first page
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken, conversationType, user]);

  useEffect(() => {
    setPage(1); // Reset page when conversation type changes
    if (accessToken) {
      fetchConversations(1); // Always fetch first page
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

  const renderConversationItem = useCallback(({ item }: { item: OneToOneConversation | GroupConversation }) => {
    if (!item) return null;
    
    let displayName = '';
    let lastMessageText = '';
    let lastMessageTime = '';
    let avatarUrl = null;
    
    try {
      if (conversationType === 'one_to_one') {
        const oneToOneConv = item as OneToOneConversation;
        
        // Handle case where participants might be null
        const participants = oneToOneConv.participants || [];
        
        // Get the display name - either from other_participant or by finding non-current user
        if (oneToOneConv.other_participant) {
          displayName = oneToOneConv.other_participant;
        } else {
          const userId = user?.id;
          if (!userId) {
            displayName = participants.map(p => p.username).join(', ');
          } else {
            const other = participants.find((p) => p.id !== Number(userId));
            displayName = other ? other.username : 'Conversation';
          }
        }
        
        if (oneToOneConv.last_message) {
          lastMessageText = oneToOneConv.last_message.content;
          lastMessageTime = new Date(oneToOneConv.last_message.timestamp).toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit'
          });
        } else {
          lastMessageTime = new Date(oneToOneConv.created_at).toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit'
          });
        }
        
        // Generate avatar url for the other user
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
        
      } else {
        const groupConv = item as GroupConversation;
        displayName = groupConv.name || 'Group Chat';
        
        if (groupConv.last_message) {
          const sender = groupConv.last_message.sender;
          lastMessageText = sender ? `${sender}: ${groupConv.last_message.content}` : groupConv.last_message.content;
          lastMessageTime = new Date(groupConv.last_message.timestamp).toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit'
          });
        } else {
          lastMessageTime = new Date(groupConv.created_at).toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit'
          });
        }
        
        // Generate avatar url for group
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
      }
    } catch (err) {
      console.error('Error rendering conversation item:', err, item);
      displayName = 'Error displaying conversation';
    }
  
    return (
      <TouchableOpacity 
        style={[
          styles.conversationItem,
          item.unread_count && item.unread_count > 0 ? styles.unreadConversation : null
        ]}
        onPress={() => {
          console.log('Navigating to chat with ID:', item.id);
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
  
  // Modify the authentication guard to only check for accessToken
  if (!accessToken) {
    console.log('Authentication required:', { hasToken: !!accessToken });
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
        data={conversations && Array.isArray(conversations) ? conversations : []}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#007BFF"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
  conversationsContainer: { 
    flex: 1,
    padding: 10 
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
  unreadConversation: {
    backgroundColor: '#F0F7FF',
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
    marginRight: 30, // Space for unread badge
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
});

export default MessagingScreen;
