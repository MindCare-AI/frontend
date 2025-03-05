import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import ChatMessageBubble from '../../components/chatbot/ChatMessageBubble';
import TypingIndicator from '../../components/chatbot/TypingIndicator';

interface Message {
  id: string;
  content: string;
  isChatbot: boolean;
  timestamp: string;
  status?: 'sending' | 'sent' | 'failed';
}

const ChatbotScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { authToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authToken) {
      initializeChat();
    }
  }, [authToken]);

  const initializeChat = async () => {
    try {
      setError(null);
      setIsRefreshing(true);
      if (!authToken) throw new Error('Not authenticated');

      const response = await axios.post(
        `${API_URL}/messaging/chatbot/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      const data = response.data as { 
        conversation_id: number, 
        conversation?: { messages: Message[] } 
      };
      
      setConversationId(data.conversation_id);
      
      if (data.conversation?.messages) {
        setMessages(data.conversation.messages
          .reverse()
          .map(msg => ({ ...msg, status: 'sent' }))
        );
      }
    } catch (error) {
      handleError(error, 'Failed to initialize chat');
    } finally {
      setIsRefreshing(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !conversationId) return;

    const tempId = Date.now().toString();
    const userMessage: Message = {
      id: tempId,
      content: inputText.trim(),
      isChatbot: false,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowTyping(true);

    try {
      const response = await axios.post(
        `${API_URL}/messaging/conversations/${conversationId}/messages/`,
        {
          content: userMessage.content,
          message_type: 'text'
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const responseData = response.data as Message[];
      const newMessages = responseData.map(msg => ({
        ...msg,
        status: 'sent' as const
      }));

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        ...newMessages
      ]);
    } catch (error) {
      handleError(error, 'Failed to send message');
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
    } finally {
      setIsLoading(false);
      setShowTyping(false);
    }
  };

  const handleError = (error: unknown, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    setError(errorMessage);
    console.error(errorMessage, error);
  };

  const retryMessage = async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'sending' } : msg
    ));

    const message = messages.find(m => m.id === messageId);
    if (!message || !conversationId) return;

    try {
      const response = await axios.post(
        `${API_URL}/messaging/conversations/${conversationId}/messages/`,
        {
          content: message.content,
          message_type: 'text'
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const responseData = response.data as Message[];
      const newMessages = responseData.map(msg => ({
        ...msg,
        status: 'sent' as const
      }));

      setMessages(prev => [
        ...prev.filter(m => m.id !== messageId),
        ...newMessages
      ]);
    } catch (error) {
      handleError(error, 'Failed to resend message');
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessageBubble
      message={item.content}
      isBot={item.isChatbot}
      timestamp={item.timestamp}
      status={item.status}
      onRetry={() => retryMessage(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Samantha AI</Text>
        <Text style={styles.headerSubtitle}>24/7 Mental Health Support</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={initializeChat}
          >
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={initializeChat}
            colors={['#002D62']}
          />
        }
        ListFooterComponent={
          <TypingIndicator visible={showTyping} />
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="How are you feeling today?"
          placeholderTextColor="#666"
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          editable={!isLoading}
        />
        
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Ionicons name="send" size={22} color="#FFF" />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#002D62',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Inter-SemiBold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#B0C4DE',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  messageList: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 100,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    flex: 1,
    marginRight: 12,
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 120,
    color: '#333',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: '#002D62',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#002D62',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
});

export default ChatbotScreen;