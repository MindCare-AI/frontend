import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  Image,
  StyleProp,
  ViewStyle
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import MessageItem from '../MessagingScreen/MessageItem';
import MessageInput from '../MessagingScreen/MessageInput';
import TypingIndicator from '../../components/chatbot/TypingIndicator';
import { Ionicons } from '@expo/vector-icons';
import ChatOptionsMenu from '../../components/chat/ChatOptionsMenu';

// Updated Interfaces
interface OneToOneParticipant {
  id: number;
  username: string;
}

interface OneToOneConversation {
  id: number;
  participants: number[];
  other_participant: { id: number; username: string }; // Fixed object type
  created_at: string;
  is_active: boolean;
  last_message?: {
    content: string;
    timestamp: string;
    sender: { id: number; username: string }; // Use sender object
  };
  unread_count: number;
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
    sender_name: string;
  };
  unread_count?: number;
  participant_count?: number;
}

export type Conversation = OneToOneConversation | GroupConversation;

// Updated Message interface (sender now is an object)
interface Message {
  id: number | string;
  content: string;
  sender: { id: number; username: string };
  timestamp: string;
  status?: 'sending' | 'sent' | 'failed';
  message_type?: string;
  is_edited?: boolean;
  reactions?: string;
}

interface ChatScreenProps {
  route: RouteProp<MessagingStackParamList, 'Chat'>;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { accessToken, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const { conversationId, conversationType, title } = route.params;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const navigation = useNavigation();

  // Configure header right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={{ padding: 8 }}
          onPress={() => setOptionsMenuVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Fetch messages for this conversation
  const fetchMessages = useCallback(async (pageNum = 1, refresh = false) => {
    if (!accessToken) return;
    
    try {
      const endpoint = conversationType === 'one_to_one'
        ? `${API_URL}/api/v1/messaging/one_to_one/${conversationId}/messages/?page=${pageNum}`
        : `${API_URL}/api/v1/messaging/groups/${conversationId}/messages/?page=${pageNum}`;
        
      setError(null);
      if (pageNum === 1 && !refresh) setIsLoading(true);
      if (refresh) setIsRefreshing(true);
      if (pageNum > 1) setLoadingMore(true);
      
      const response = await retryFetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Handle 404 for "Invalid page" specifically as end of pagination
      if (response.status === 404) {
        const errorData = await response.json();
        if (errorData.detail === "Invalid page.") {
          setHasMoreMessages(false);
          setLoadingMore(false);
          return;
        } else {
          throw new Error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}`);
      }
      
      const data = await response.json();
      const messageList = data.results || data;
      
      if (!Array.isArray(messageList)) {
        throw new Error('Unexpected response format');
      }
      
      setHasMoreMessages(data.next ? true : false);
      
      if (pageNum === 1) {
        setMessages(messageList);
      } else {
        setMessages(prev => [...prev, ...messageList]);
      }
      
      // Mark conversation as read for one-to-one chats
      if (conversationType === 'one_to_one' && messageList.length > 0) {
        markConversationAsRead();
      }
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      setError(error.message);
      if (page > 1) {
        setHasMoreMessages(false);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setLoadingMore(false);
    }
  }, [conversationId, conversationType, accessToken, page]);
  
  const markConversationAsRead = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const endpoint = conversationType === 'one_to_one'
        ? `${API_URL}/api/v1/messaging/one_to_one/${conversationId}/`
        : `${API_URL}/api/v1/messaging/groups/${conversationId}/`;
        
      await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  }, [conversationId, conversationType, accessToken]);
  
  const sendMessage = async (content: string, messageType = 'text') => {
    // Use backend limits: group => 5000, one_to_one => 1000 (example values)
    const maxLength = conversationType === 'group' ? 5000 : 1000;
    if (content.length > maxLength) {
      return Alert.alert('Error', `Message too long (max ${maxLength} characters)`);
    }
    if (!content.trim() || !accessToken) return;
    
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      sender: { id: Number(user?.id) || 0, username: user?.username || 'You' },
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prev => [optimisticMessage, ...prev]);
    
    try {
      const endpoint = conversationType === 'one_to_one' 
        ? `${API_URL}/api/v1/messaging/one_to_one/messages/` 
        : `${API_URL}/api/v1/messaging/groups/messages/`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          conversation: conversationId,
          message_type: messageType
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}`);
      }
      
      const sentMessage = await response.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? sentMessage : msg
      ));
      
      fetchMessages(1, true);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError(error.message);
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? { ...msg, status: 'failed' }
          : msg
      ));
    }
  };
  
  const handleRetry = (failedMessageId: string) => {
    const failedMessage = messages.find(msg => String(msg.id) === failedMessageId);
    if (failedMessage) {
      setMessages(prev => prev.filter(msg => String(msg.id) !== failedMessageId));
      sendMessage(failedMessage.content, failedMessage.message_type);
    }
  };
  
  const handleLoadMore = () => {
    if (!loadingMore && hasMoreMessages) {
      setPage(prev => prev + 1);
      fetchMessages(page + 1);
    }
  };
  
  const handleRefresh = () => {
    setPage(1);
    fetchMessages(1, true);
  };
  
  const handleMessageChange = () => {
    // Typing indicator logic (if needed)
  };
  
  // Remove WebSocket code since backend does not support it
  
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  
  // Update search to use "query" parameter per backend requirement
  const handleSearch = async (query: string) => {
    if (!query.trim() || !accessToken) return;
    
    try {
      setIsLoading(true);
      const endpoint = conversationType === 'one_to_one'
        ? `${API_URL}/api/v1/messaging/one_to_one/${conversationId}/search/?q=${encodeURIComponent(query)}`
        : `${API_URL}/api/v1/messaging/groups/${conversationId}/search/?q=${encodeURIComponent(query)}`;
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}`);
      }
      
      const searchResults = await response.json();
      setMessages(searchResults);
    } catch (error: any) {
      console.error('Error searching messages:', error);
      setError(error.message);
      Alert.alert('Error', 'Failed to search messages');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render each message using MessageItem and ensuring message.sender is used
  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender.id === (user?.id || -1);
    const senderName = isCurrentUser ? 'You' : item.sender.username;
    
    return (
      <MessageItem
        id={String(item.id)}
        content={item.content}
        conversationType={conversationType} // <-- pass conversationType here
        sender={{
          id: item.sender.id,
          name: senderName,
        }}
        timestamp={item.timestamp}
        isCurrentUser={isCurrentUser}
        status={
          isCurrentUser 
            ? (item.status === 'sending'
              ? 'sent'
              : item.status === 'failed'
              ? undefined
              : 'sent')
            : undefined
        }
        isEdited={item.is_edited}
        reactions={item.reactions}
        onRetry={item.status === 'failed' ? () => handleRetry(String(item.id)) : undefined}
        onEdit={(id, content) => {
          setEditingMessage({
            id: id,
            content: content,
            sender: item.sender,
            timestamp: item.timestamp
          });
        }}
        onDelete={(id) => {
          handleDeleteMessage(id);
        }}
      />
    );
  };
  
  const handleEditMessage = async (messageId: string | number, newContent: string) => {
    if (!accessToken) return;

    try {
      const endpoint = conversationType === 'one_to_one'
        ? `${API_URL}/api/v1/messaging/one_to_one/messages/${messageId}/`
        : `${API_URL}/api/v1/messaging/groups/messages/${messageId}/`;
        
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}`);
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent, is_edited: true } : msg
      ));
      setEditingMessage(null);
    } catch (error: any) {
      console.error('Error editing message:', error);
      setError(error.message);
      Alert.alert('Error', 'Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string | number) => {
    if (conversationType === 'group') {
      const conv = conversation as GroupConversation; // Ensure conversation is defined
      // Check if the current user is a moderator
      const isModerator = conv.moderators?.includes(Number(user?.id));
      const message = messages.find(msg => msg.id === messageId);
      if (!isModerator && message?.sender.id !== user?.id) {
        return Alert.alert('Error', 'Only moderators can delete group messages');
      }
    }
    // Proceed with deletion...
    
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              const endpoint = conversationType === 'one_to_one'
                ? `${API_URL}/messaging/one_to_one/messages/${messageId}/`
                : `${API_URL}/messaging/groups/messages/${messageId}/`;
                
              const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}`);
              }
              
              setMessages(prev => prev.filter(msg => msg.id !== messageId));
            } catch (error: any) {
              console.error('Error deleting message:', error);
              setError(error.message);
              Alert.alert('Error', 'Failed to delete message');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Render conversation items using the updated other_participant for one-to-one
  const renderConversationItem = useCallback(
    ({ item }: { item: Conversation }) => {
      if (!user) return null;
  
      let displayName = '';
      let lastMessageText = '';
      let lastMessageTime = '';
      let avatarUrl = '';
      // Use StyleProp<ViewStyle> for containerStyle
      let containerStyle: StyleProp<ViewStyle> = styles.conversationItem;
  
      try {
        if (conversationType === 'one_to_one') {
          const conv = item as OneToOneConversation;
          const displayName = conv.other_participant?.username || title || 'Unknown User';
  
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
          avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            displayName
          )}&background=random`;
        } else {
          const conv = item as GroupConversation;
          displayName = conv.name || 'Group Chat';
  
          if (conv.last_message) {
            const sender = conv.last_message.sender_name;
            lastMessageText = sender
              ? `${sender}: ${conv.last_message.content}`
              : conv.last_message.content;
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
          avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            displayName
          )}&background=random`;
        }
        
        // If conversation is archived, apply style change.
        if ((item as any)?.archived) {
          containerStyle = [styles.conversationItem, { opacity: 0.5 }];
        }
      } catch (err) {
        console.error('Error parsing conversation:', err);
        displayName = 'Error displaying user';
      }
  
      return (
        <TouchableOpacity
          style={containerStyle}
          onPress={() => {
            navigation.navigate('App', {
              screen: 'Chat', // Change from "Messaging" to "Chat"
              params: {
                conversationId: item.id,
                conversationType: conversationType,
                title: displayName,
                otherParticipantId:
                  conversationType === 'one_to_one'
                    ? (item as OneToOneConversation).other_participant?.id
                    : undefined
              },
            });
          }}
        >
          <Image
            source={{
              uri: avatarUrl || 'https://ui-avatars.com/api/?name=User&background=random'
            }}
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
    },
    [conversationType, navigation, title, user]
  );
  
  useEffect(() => {
    if ((conversation as any)?.archived) {
      Alert.alert('Archived', 'This conversation is archived and cannot be modified');
      navigation.goBack();
    }
  }, [conversation]);
  
  if (!accessToken) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Authentication required.</Text>
      </View>
    );
  }
  
  if (isLoading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchMessages()}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#007BFF']}
              tintColor="#007BFF"
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#007BFF" />
              </View>
            ) : null
          }
          ListHeaderComponent={isTyping ? <TypingIndicator visible={true} /> : null}
        />
      )}
      
      {editingMessage ? (
        <MessageInput 
          onSend={(content) => handleEditMessage(editingMessage.id, content)}
          conversationType={conversationType}
          initialValue={editingMessage.content}
          isEditing={true}
          onCancelEdit={() => setEditingMessage(null)}
        />
      ) : (
        <MessageInput 
          onSend={sendMessage} 
          conversationType={conversationType}
          onTyping={handleMessageChange}
        />
      )}
      
      <ChatOptionsMenu
        visible={optionsMenuVisible}
        onClose={() => setOptionsMenuVisible(false)}
        onSearch={() => {
          setOptionsMenuVisible(false);
          setSearchVisible(true);
        }}
        onClearHistory={() => {
          Alert.alert(
            'Clear Chat History',
            'Are you sure you want to clear all messages? This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Clear', 
                style: 'destructive',
                onPress: () => {
                  // Implement clear history API call
                  setOptionsMenuVisible(false);
                }
              }
            ]
          );
        }}
        onMute={() => {
          // Implement mute functionality
          setOptionsMenuVisible(false);
        }}
        onBlock={() => {
          // Implement block functionality for 1:1 chats
          setOptionsMenuVisible(false);
        }}
        isGroupChat={conversationType === 'group'}
        onViewParticipants={() => {
          // Navigate to participants screen
          setOptionsMenuVisible(false);
        }}
        onLeaveGroup={() => {
          // Implement leave group functionality
          setOptionsMenuVisible(false);
        }}
      />
      
      {searchVisible && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => handleSearch(searchQuery)}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeSearchButton}
            onPress={() => {
              setSearchVisible(false);
              setSearchQuery('');
              fetchMessages(1, true);
            }}
          >
            <Ionicons name="close" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const retryFetch = async (url: string, options = {}, retries = 3): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 2 ** (3 - retries) * 1000));
      return retryFetch(url, options, retries - 1);
    }
    throw error;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  messageList: {
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007BFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeSearchButton: {
    padding: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
    alignItems: 'center',
  },
  unreadConversation: {
    backgroundColor: '#F0F7FF',
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
});



export default ChatScreen;