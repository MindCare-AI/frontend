// screens/ChatbotScreen/ChatbotScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useChatbot } from '../../hooks/ChatbotScreen/useChatbot';
import { ChatMessage, ChatbotConversation } from '../../types/chatbot/chatbot';
import { chatbotApi } from '../../API/chatbot/chatbot';

// Import the ChatbotStackParamList
import { ChatbotStackParamList } from '../../navigation/types';

type ChatbotScreenRouteProp = RouteProp<ChatbotStackParamList, 'ChatbotConversation'>;
type ChatbotScreenNavigationProp = StackNavigationProp<ChatbotStackParamList, 'ChatbotConversation'>;

const ChatbotScreen: React.FC = () => {
  const route = useRoute<ChatbotScreenRouteProp>();
  const navigation = useNavigation<ChatbotScreenNavigationProp>();
  const { conversationId, autoCreate } = route.params || {};
  
  // Add navigation function to go back to conversation list
  const goToConversationList = () => {
    navigation.navigate('ChatbotHome');
  };
  
  const {
    currentConversation,
    messages,
    loading,
    error,
    sendingMessage,
    loadingMessages,
    hasMoreMessages,
    conversations,
    fetchMessages,
    sendMessage,
    setCurrentConversation,
    setMessages,
    createConversation,
    clearError,
    loadMoreMessages,
  } = useChatbot();

  const [messageText, setMessageText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingConversation, setFetchingConversation] = useState(false);

  // Initialize conversation
  useEffect(() => {
    const initializeConversation = async () => {
      if (conversationId) {
        // Find existing conversation
        const existingConversation = conversations.find(conv => conv.id === conversationId);
        if (existingConversation && 'user' in existingConversation) {
          setCurrentConversation(existingConversation as ChatbotConversation);
          fetchMessages(conversationId);
        } else {
          // If conversation not in list, fetch it directly from API
          try {
            console.log('[ChatbotScreen] Fetching conversation from API:', conversationId);
            const conversation = await chatbotApi.getConversation(conversationId);
            setCurrentConversation(conversation);
            // Set messages from the conversation response
            if (conversation.messages) {
              console.log('[ChatbotScreen] Setting messages from conversation:', conversation.messages.length, 'messages');
              setMessages(conversation.messages);
            }
          } catch (error) {
            console.error('[ChatbotScreen] Failed to fetch conversation:', error);
          }
        }
      } else if (autoCreate) {
        // Create new conversation
        const newConversation = await createConversation({
          title: `Chat ${new Date().toLocaleDateString()}`,
        });
        if (newConversation) {
          fetchMessages(newConversation.id);
        }
      } else if (conversations.length > 0) {
        // Use first conversation if no specific one provided
        const firstConv = conversations[0];
        if ('user' in firstConv) {
          setCurrentConversation(firstConv as ChatbotConversation);
          fetchMessages(firstConv.id);
        }
      } else {
        // No conversations exist, create one
        console.log('[ChatbotScreen] No conversations exist, creating first one');
        const newConversation = await createConversation({
          title: `Chat ${new Date().toLocaleDateString()}`,
        });
        if (newConversation) {
          console.log('[ChatbotScreen] Auto-created conversation:', newConversation.id);
          // The conversation will be set as current in the createConversation hook
        }
      }
    };

    if (conversations.length > 0 || autoCreate || (!conversationId && conversations.length === 0)) {
      initializeConversation();
    }
  }, [conversationId, autoCreate, conversations, setCurrentConversation, fetchMessages, createConversation]);

  // Handle send message
  const handleSendMessage = async () => {
    console.log('[ChatbotScreen] handleSendMessage called');
    console.log('[ChatbotScreen] messageText:', messageText);
    console.log('[ChatbotScreen] currentConversation:', currentConversation?.id);
    console.log('[ChatbotScreen] sendingMessage:', sendingMessage);
    
    if (!messageText.trim() || sendingMessage) {
      console.log('[ChatbotScreen] Early return - no message text or already sending');
      return;
    }

    // If no current conversation, create one automatically
    if (!currentConversation) {
      console.log('[ChatbotScreen] No current conversation');
      
      // For testing - try to use conversation ID 2 if it exists
      try {
        console.log('[ChatbotScreen] Attempting to use conversation ID 2...');
        setFetchingConversation(true); // Add loading state
        const conversation = await chatbotApi.getConversation(2);
        console.log('[ChatbotScreen] Found conversation 2:', conversation);
        setCurrentConversation(conversation);
        if (conversation.messages && conversation.messages.length > 0) {
          setMessages(conversation.messages);
        }
        setFetchingConversation(false); // Stop loading
        // Send the message to conversation 2
        const message = messageText.trim();
        setMessageText('');
        await sendMessage(2, message);
        return;
      } catch (error) {
        console.log('[ChatbotScreen] Conversation 2 not found or error:', error);
        setFetchingConversation(false); // Stop loading on error
      }
      
      // First, try to use an existing conversation if available
      if (conversations.length > 0) {
        const firstConv = conversations[0];
        if ('user' in firstConv) {
          console.log('[ChatbotScreen] Using first available conversation:', firstConv.id);
          setCurrentConversation(firstConv as ChatbotConversation);
          // Send message after setting conversation
          const message = messageText.trim();
          setMessageText('');
          await sendMessage(firstConv.id, message);
          return;
        }
      }
      
      // If no conversations available, create one
      console.log('[ChatbotScreen] Creating new conversation for message...');
      const newConversation = await createConversation({
        title: `Chat ${new Date().toLocaleDateString()}`,
      });
      
      if (!newConversation) {
        console.log('[ChatbotScreen] Failed to create conversation');
        return;
      }
      
      console.log('[ChatbotScreen] Created new conversation:', newConversation.id);
      // Continue with sending the message using the new conversation
      const message = messageText.trim();
      setMessageText('');
      await sendMessage(newConversation.id, message);
      return;
    }

    const message = messageText.trim();
    setMessageText('');
    
    try {
      console.log('[ChatbotScreen] About to call sendMessage with:', { conversationId: currentConversation.id, message });
      await sendMessage(currentConversation.id, message);
      console.log('[ChatbotScreen] sendMessage completed successfully');
    } catch (error) {
      console.log('[ChatbotScreen] sendMessage error:', error);
      // Error is handled by the hook
      setMessageText(message); // Restore message on error
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (!currentConversation) return;
    
    setRefreshing(true);
    try {
      await fetchMessages(currentConversation.id);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle load more messages
  const handleLoadMore = () => {
    if (currentConversation && hasMoreMessages && !loadingMessages) {
      loadMoreMessages(currentConversation.id);
    }
  };

  // Render message item
  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.is_bot ? styles.botMessage : styles.userMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.is_bot ? styles.botBubble : styles.userBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.is_bot ? styles.botText : styles.userText
        ]}>
          {item.content}
        </Text>
        {item.is_bot && item.chatbot_method && (
          <Text style={styles.methodText}>Method: {item.chatbot_method}</Text>
        )}
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={goToConversationList} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>
          {currentConversation?.title || 'Chatbot'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {currentConversation ? `${messages.length} messages` : 'No conversation'}
        </Text>
      </View>
      {currentConversation && (
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => {
            if (currentConversation) {
              navigation.navigate('ConversationSettings', {
                conversationId: currentConversation.id
              });
            }
          }}
        >
          <Icon name="settings" size={24} color="#007AFF" />
        </TouchableOpacity>
      )}
    </View>
  );

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  // Show loading screen during initial load or when fetching conversation
  if ((loading && !currentConversation) || (loadingMessages && messages.length === 0) || fetchingConversation) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {fetchingConversation ? 'Loading conversation...' : 
             loading ? 'Loading conversation...' : 'Loading messages...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages List */}
        <FlatList
          data={[...messages].reverse()} // Reverse the messages array for proper display with inverted FlatList
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted // This makes newest messages appear at bottom (normal chat behavior)
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loadingMessages && messages.length > 0 ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Loading more messages...</Text>
              </View>
            ) : null
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type your message..."
            multiline
            maxLength={1000}
            editable={!sendingMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || sendingMessage) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#1F2937',
  },
  methodText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  loadingMore: {
    padding: 16,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});

export default ChatbotScreen;
