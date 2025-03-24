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
  Text
} from 'react-native';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import MessageItem from '../MessagingScreen/MessageItem';
import MessageInput from '../MessagingScreen/MessageInput';
import TypingIndicator from '../../components/chatbot/TypingIndicator';
import { Ionicons } from '@expo/vector-icons';

type ChatScreenRouteProp = RouteProp<MessagingStackParamList, 'Chat'>;

interface Message {
  id: number | string;
  content: string;
  sender: number;
  sender_name: string;
  timestamp: string;
  conversation: number;
  is_edited?: boolean;
  reactions?: string;
  read_by?: string;
  message_type?: 'text' | 'image' | 'file' | 'audio';
  sendingFailed?: boolean;
}

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { conversationId, conversationType, title } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { accessToken, user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEventRef = useRef<number>(0);
  
  // Fetch messages for this conversation
  const fetchMessages = useCallback(async (pageNum = 1, refresh = false) => {
    if (!accessToken) return;
    
    try {
      const endpoint = conversationType === 'one_to_one' 
        ? `${API_URL}/messaging/one_to_one/messages/?conversation=${conversationId}&page=${pageNum}&page_size=20` 
        : `${API_URL}/messaging/groups/messages/?conversation=${conversationId}&page=${pageNum}&page_size=20`;
        
      setError(null);
      if (pageNum === 1 && !refresh) setIsLoading(true);
      if (refresh) setIsRefreshing(true);
      if (pageNum > 1) setLoadingMore(true);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // Check if the response has results (paginated) or is an array
      const messageList = data.results || data;
      
      if (!Array.isArray(messageList)) {
        throw new Error('Unexpected response format');
      }
      
      // Update pagination state
      if (data.next) {
        setHasMoreMessages(true);
      } else {
        setHasMoreMessages(false);
      }
      
      if (pageNum === 1) {
        setMessages(messageList);
      } else {
        setMessages(prev => [...prev, ...messageList]);
      }
      
      // Mark messages as read
      if (conversationType === 'one_to_one' && messageList.length > 0) {
        markConversationAsRead();
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setLoadingMore(false);
    }
  }, [conversationId, conversationType, accessToken]);
  
  const markConversationAsRead = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      // This endpoint might differ based on your API - adjust as needed
      const endpoint = conversationType === 'one_to_one'
        ? `${API_URL}/messaging/one_to_one/${conversationId}/`
        : `${API_URL}/messaging/groups/${conversationId}/`;
        
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
  
  const sendTypingStatus = useCallback(async () => {
    if (!accessToken || conversationType !== 'one_to_one') return;
    
    const now = Date.now();
    // Only send typing event at most once every 2 seconds
    if (now - lastTypingEventRef.current < 2000) return;
    
    lastTypingEventRef.current = now;
    
    try {
      const endpoint = `${API_URL}/messaging/one_to_one/${conversationId}/typing/`;
      
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to send typing status:', error);
    }
  }, [conversationId, conversationType, accessToken]);
  
  const sendMessage = async (content: string, messageType = 'text') => {
    if (!content.trim() || !accessToken) return;
    
    // Clear typing timeout when sending a message
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // Create optimistic update for immediate feedback
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      sender: user?.id ? Number(user.id) : 0,
      sender_name: user?.username || 'You',
      timestamp: new Date().toISOString(),
      conversation: Number(conversationId),
      message_type: messageType as 'text',
    };
    
    // Add to messages for immediate feedback
    setMessages(prev => [optimisticMessage, ...prev]);
    
    try {
      const endpoint = conversationType === 'one_to_one' 
        ? `${API_URL}/messaging/one_to_one/messages/` 
        : `${API_URL}/messaging/groups/messages/`;
        
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
        throw new Error('Failed to send message');
      }
      
      const sentMessage = await response.json();
      
      // Replace the optimistic message with the real one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? sentMessage : msg
      ));
      
      // Refresh messages to ensure everything is in sync
      fetchMessages(1, true);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Mark the optimistic message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? {...msg, sendingFailed: true} 
          : msg
      ));
    }
  };
  
  const handleRetry = (failedMessageId: string) => {
    // Find the failed message and retry sending it
    const failedMessage = messages.find(msg => msg.id === failedMessageId);
    if (failedMessage) {
      // Remove the failed message
      setMessages(prev => prev.filter(msg => msg.id !== failedMessageId));
      // Resend it
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
    // Send typing indicator
    sendTypingStatus();
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to clear typing status
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      typingTimeoutRef.current = null;
    }, 3000);
  };
  
  // Initial fetch
  useEffect(() => {
    fetchMessages();
    
    // Cleanup typing timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [fetchMessages]);
  
  // Set up WebSocket for real-time updates
  useEffect(() => {
    if (!accessToken) return;
    
    // This is a placeholder for WebSocket implementation
    // You would implement actual WebSocket connection here
    const connectWebSocket = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsURL = `${wsProtocol}//${window.location.host}/ws/chat/${conversationId}/?token=${accessToken}`;
      
      try {
        const socket = new WebSocket(wsURL);
        
        socket.onopen = () => {
          console.log('WebSocket connected');
        };
        
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_message') {
            // Add new message to the state
            setMessages(prev => [data.message, ...prev]);
          } else if (data.type === 'typing') {
            // Show typing indicator
            setIsTyping(true);
            
            // Clear typing indicator after 3 seconds of inactivity
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
              typingTimeoutRef.current = null;
            }, 3000);
          }
        };
        
        socket.onclose = () => {
          console.log('WebSocket disconnected');
          // Attempt to reconnect
          setTimeout(connectWebSocket, 5000);
        };
        
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        return socket;
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        return null;
      }
    };
    
    // Uncomment when your backend supports WebSockets
    // const socket = connectWebSocket();
    
    // return () => {
    //   if (socket) {
    //     socket.close();
    //   }
    // };
  }, [accessToken, conversationId]);
  
  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender === (user?.id ? Number(user.id) : undefined);
    
    return (
      <MessageItem
        id={String(item.id)}
        content={item.content}
        sender={{
          id: item.sender,
          name: item.sender_name,
        }}
        timestamp={item.timestamp}
        isCurrentUser={isCurrentUser}
        status={isCurrentUser ? (item.read_by ? 'read' : 'sent') : undefined}
        isEdited={item.is_edited}
        reactions={item.reactions}
        onRetry={item.sendingFailed ? () => handleRetry(String(item.id)) : undefined}
      />
    );
  };
  
  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
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
      
      <MessageInput 
        onSend={sendMessage} 
        conversationType={conversationType}
        onTyping={handleMessageChange}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
});

export default ChatScreen;