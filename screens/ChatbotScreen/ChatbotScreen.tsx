import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatbot } from '../../hooks/ChatbotScreen/useChatbot';
import { AnimatedBotMessage } from '../../components/ChatbotScreen/AnimatedBotMessage';
import { TypingIndicator } from '../../components/ChatbotScreen/TypingIndicator';

const ChatbotScreen: React.FC = () => {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    isTyping,
    retryMessage,
  } = useChatbot();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, fadeAnim, slideAnim]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      // Use a slight delay to ensure the FlatList has rendered the new message
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (isTyping && flatListRef.current) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const messageText = inputText.trim();
    setInputText('');
    
    try {
      await sendMessage(messageText);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleRetry = async (messageId: string) => {
    try {
      await retryMessage(messageId);
    } catch (err) {
      console.error('Error retrying message:', err);
    }
  };

  // Sort messages by timestamp and remove duplicates
  const sortedMessages = React.useMemo(() => {
    if (!Array.isArray(messages)) return [];
    
    // Remove duplicates based on ID
    const uniqueMessages = messages.filter((message, index, self) => 
      index === self.findIndex(m => m.id === message.id)
    );
    
    // Sort by timestamp (oldest first for correct chronological order)
    return uniqueMessages.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });
  }, [messages]);

  const renderMessage = ({ item, index }: { item: any; index: number }) => (
    <AnimatedBotMessage
      message={item}
      index={index}
    />
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return <TypingIndicator visible={isTyping} />;
  };

  const renderLoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <Animated.View style={[
        styles.loadingContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
        <View style={styles.loadingBotContainer}>
          <View style={styles.loadingBot}>
            <Text style={styles.loadingBotEmoji}>🤖</Text>
          </View>
        </View>
        
        <Text style={styles.loadingTitle}>MindCare AI</Text>
        <Text style={styles.loadingSubtitle}>Your AI companion is ready to help</Text>
        
        <View style={styles.loadingDotsContainer}>
          <ActivityIndicator size="small" color="#4A90E2" />
        </View>
      </Animated.View>
    </View>
  );

  if (isLoading) {
    return renderLoadingScreen();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>🤖</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>MindCare AI</Text>
                <View style={styles.statusContainer}>
                  <View style={styles.onlineIndicator} />
                  <Text style={styles.headerSubtitle}>Online</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.headerButton}
              onPress={clearHistory}
            >
              <Ionicons name="refresh-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages Container */}
        <KeyboardAvoidingView
          style={styles.messagesContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={sortedMessages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            style={styles.messagesList}
            contentContainerStyle={[
              styles.messagesContent,
              sortedMessages.length === 0 && styles.emptyMessagesContent
            ]}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
            getItemLayout={undefined} // Let FlatList calculate item heights dynamically
            ListFooterComponent={renderTypingIndicator}
            ListEmptyComponent={() => (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateBot}>
                  <Text style={styles.emptyStateBotEmoji}>🤖</Text>
                </View>
                <Text style={styles.emptyStateTitle}>Hello! I'm MindCare AI</Text>
                <Text style={styles.emptyStateSubtitle}>
                  I'm here to help you with mental health support and guidance. 
                  Feel free to ask me anything!
                </Text>
              </View>
            )}
            onContentSizeChange={() => {
              // Only auto-scroll if we have messages
              if (sortedMessages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
          />

          {/* Modern Input Area */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message MindCare AI..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={1000}
                onSubmitEditing={Platform.OS === 'ios' ? undefined : handleSend}
                blurOnSubmit={false}
                returnKeyType="send"
              />
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isSending) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingBotContainer: {
    marginBottom: 30,
  },
  loadingBot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBotEmoji: {
    fontSize: 30,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingDotsContainer: {
    marginTop: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyMessagesContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    maxHeight: 120,
    paddingVertical: 8,
    paddingRight: 12,
    lineHeight: 20,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateBot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateBotEmoji: {
    fontSize: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ChatbotScreen;
