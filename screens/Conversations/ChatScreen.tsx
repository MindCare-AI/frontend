import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { 
  useRoute, 
  useNavigation, 
  RouteProp, 
  ParamListBase, 
  NavigationProp 
} from '@react-navigation/native';
import { getConversationById, sendMessage, markAsRead } from '../../API/conversations';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { OneToOneMessage, OneToOneConversation } from '../../types/messaging/one_to_one_messages';
import { GroupMessage, GroupConversation } from '../../types/messaging/group_messages';
import { BaseMessage } from '../../types/messaging/commons';

type ExtendedParamList = ParamListBase & {
  ChatScreen: { conversationId: string | number };
  ConversationDetails: { conversationId: string | number };
};

type ChatScreenRouteProp = RouteProp<ExtendedParamList, 'ChatScreen'>;

type Message = OneToOneMessage | GroupMessage | BaseMessage;
type Conversation = OneToOneConversation | GroupConversation;

const { width } = Dimensions.get('window');

// Extract the MessageItem component
const MessageItem: React.FC<{ 
  item: Message;
  index: number;
  isUserMessage: boolean;
  showAvatar: boolean;
  user: any;
  formatMessageTime: (timestamp: string) => string;
  handleResendMessage: (message: Message) => void;
}> = ({ item, index, isUserMessage, showAvatar, user, formatMessageTime, handleResendMessage }) => {
  const senderName = item.sender_name;
  const senderInitial = senderName ? senderName.charAt(0).toUpperCase() : '?';
  const messageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = 50 * (index % 10);
    const timer = setTimeout(() => {
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [index, messageOpacity]);

  return (
    <Animated.View 
      style={[
        styles.messageRow,
        isUserMessage ? styles.userMessageRow : styles.otherMessageRow,
        { opacity: messageOpacity }
      ]}
    >
      {showAvatar && !isUserMessage && (
        <View style={styles.avatarContainer}>
          <View style={styles.messageAvatar}>
            <Text style={styles.avatarText}>{senderInitial}</Text>
          </View>
        </View>
      )}
      
      <View style={[
        isUserMessage ? styles.userMessageContainer : styles.otherMessageContainer,
        showAvatar && !isUserMessage ? { maxWidth: '70%' } : {}
      ]}>
        {(showAvatar && !isUserMessage) && (
          <Text style={styles.messageSender}>{item.sender_name}</Text>
        )}
        
        <View style={[
          styles.messageBubble,
          isUserMessage ? styles.userMessageBubble : styles.otherMessageBubble,
          item.status === 'failed' && styles.failedMessage
        ]}>
          <Text style={[
            styles.messageText,
            isUserMessage ? styles.userMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
        </View>
        
        <View style={[
          styles.messageFooter,
          isUserMessage ? styles.userMessageFooter : styles.otherMessageFooter
        ]}>
          <Text style={styles.messageTime}>
            {formatMessageTime(item.timestamp)}
          </Text>
          
          {isUserMessage && item.status && (
            <View style={styles.statusContainer}>
              {item.status === 'sending' && (
                <ActivityIndicator size={12} color="#999" />
              )}
              {item.status === 'sent' && (
                <Ionicons name="checkmark" size={14} color="#999" />
              )}
              {item.status === 'delivered' && (
                <Ionicons name="checkmark-done" size={14} color="#999" />
              )}
              {item.status === 'read' && (
                <Ionicons name="checkmark-done" size={14} color="#4CAF50" />
              )}
              {item.status === 'failed' && (
                <Ionicons name="alert-circle" size={14} color="#F44336" />
              )}
            </View>
          )}
        </View>
        
        {item.status === 'failed' && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => handleResendMessage(item)}
          >
            <Text style={styles.retryText}>Retry</Text>
            <Ionicons name="refresh" size={14} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>
      
      {isUserMessage && (
        <View style={styles.avatarContainer}>
          {user && 'profile_pic' in user && user.profile_pic ? (
            <Image 
              source={{ uri: typeof user.profile_pic === 'string' ? user.profile_pic : '' }} 
              style={styles.messageAvatar} 
            />
          ) : (
            <View style={styles.messageAvatar}>
              <Text style={styles.avatarText}>
                {(user?.username?.charAt(0) || 'M').toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<NavigationProp<ExtendedParamList>>();
  const { user } = useAuth();
  const { conversationId } = route.params || { conversationId: '' };
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animateNewMessage = (messageRef: Animated.Value) => {
    Animated.sequence([
      Animated.timing(messageRef, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const formatMessageTime = useCallback((timestamp: string) => {
    try {
      const messageDate = new Date(timestamp);
      const now = new Date();
      
      if (messageDate.toDateString() === now.toDateString()) {
        return format(messageDate, 'h:mm a');
      }
      
      if (messageDate.getFullYear() === now.getFullYear()) {
        return format(messageDate, 'MMM d, h:mm a');
      }
      
      return format(messageDate, 'MMM d, yyyy, h:mm a');
    } catch (e) {
      return timestamp.toString();
    }
  }, []);

  const handleResendMessage = useCallback(async (failedMessage: Message) => {
    try {
      setMessages(prev => prev.filter(msg => msg.id !== failedMessage.id));
      setMessageText(failedMessage.content);
      setTimeout(() => handleSendMessage(), 100);
    } catch (err) {
      console.error('Error resending message:', err);
    }
  }, [messageText]);

  const toggleAttachmentOptions = () => {
    if (showAttachmentOptions) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowAttachmentOptions(false));
    } else {
      setShowAttachmentOptions(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  useEffect(() => {
    const fetchConversationData = async () => {
      if (!conversationId) {
        setError('Invalid conversation ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const conversationData = await getConversationById(conversationId) as Conversation;
        setConversation(conversationData);

        let title = '';
        let avatarUrl = null;

        if (conversationData.is_group) {
          title = conversationData.name || 'Group Chat';
          navigation.setOptions({
            headerTitle: () => (
              <View style={styles.headerTitleContainer}>
                <View style={[styles.headerAvatar, {backgroundColor: '#9b59b6'}]}>
                  <Ionicons name="people" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>{title}</Text>
                  <Text style={styles.headerSubtitle}>
                    {conversationData.participants?.length || 0} members
                  </Text>
                </View>
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => navigation.navigate('ConversationDetails', { conversationId })}
              >
                <Ionicons name="ellipsis-vertical" size={24} color="#002D62" />
              </TouchableOpacity>
            ),
          });
        } else {
          const otherParticipant = conversationData.other_participant;
          title = conversationData.other_user_name || otherParticipant?.username || 'Chat';
          navigation.setOptions({
            headerTitle: () => (
              <View style={styles.headerTitleContainer}>
                {otherParticipant?.profile_pic ? (
                  <Image 
                    source={{ uri: otherParticipant.profile_pic }} 
                    style={styles.headerAvatar} 
                  />
                ) : (
                  <View style={[styles.headerAvatar, {backgroundColor: '#3498db'}]}>
                    <Text style={styles.avatarText}>
                      {title.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View>
                  <Text style={styles.headerTitle}>{title}</Text>
                  <Text style={styles.headerSubtitle}>
                    {otherParticipant?.user_type === 'therapist' ? 'Therapist' : 'Patient'}
                  </Text>
                </View>
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => navigation.navigate('ConversationDetails', { conversationId })}
              >
                <Ionicons name="ellipsis-vertical" size={24} color="#002D62" />
              </TouchableOpacity>
            ),
          });
        }

        if (conversationData.messages && Array.isArray(conversationData.messages)) {
          const sortedMessages = [...conversationData.messages].sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB.getTime() - dateA.getTime();
          });
          setMessages(sortedMessages);
        } else {
          setMessages([]);
        }

        await markAsRead(conversationId);
        setLoading(false);
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Failed to load conversation');
        setLoading(false);
      }
    };
    
    fetchConversationData();
  }, [conversationId, navigation]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      setSending(true);
      const newMessageAnimation = new Animated.Value(0);
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation: conversationId,
        content: messageText,
        message_type: 'text',
        sender: user?.id || '',
        sender_id: user?.id || '',
        sender_name: user?.username || 'Me',
        timestamp: new Date().toISOString(),
        media: null,
        status: 'sending',
      };
      
      setMessages(prev => [tempMessage, ...prev]);
      setMessageText('');
      animateNewMessage(newMessageAnimation);
      
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
      
      if (conversationId) {
        const response = await sendMessage(
          conversationId, 
          tempMessage.content,
          conversation?.is_group || false
        );
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id
              ? { ...tempMessage, ...(typeof response === 'object' ? response : {}), status: 'sent' }
              : msg
          )
        );
        
        const updatedConversation = await getConversationById(conversationId) as Conversation;
        setConversation(updatedConversation);
      }
      
      setSending(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => 
        prev.map(msg => {
          if (msg.id === `temp-${Date.now()}`) {
            return { ...msg, status: 'failed' };
          }
          return msg;
        })
      );
      setSending(false);
    }
  };

  const renderMessageItem = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isUserMessage = item.sender_id === user?.id;
    const showAvatar = !isUserMessage && (conversation?.is_group ?? false);
    
    return (
      <MessageItem 
        item={item} 
        index={index}
        isUserMessage={isUserMessage}
        showAvatar={showAvatar}
        user={user}
        formatMessageTime={formatMessageTime}
        handleResendMessage={handleResendMessage}
      />
    );
  }, [user, conversation, formatMessageTime, handleResendMessage]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#F0F8FF', '#F5F5F5']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002D62" />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#F0F8FF', '#F5F5F5']} style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButtonLarge}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F0F8FF', '#F5F5F5']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.dateHeaderContainer}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateHeaderText}>
                {messages.length > 0 
                  ? format(new Date(messages[0].timestamp), 'MMMM d, yyyy')
                  : 'Today'}
              </Text>
            </View>
          </View>
          
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id.toString()}
            inverted
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#CCCCCC" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubText}>Send a message to start the conversation</Text>
              </View>
            }
          />
          
          {showAttachmentOptions && (
            <Animated.View 
              style={[
                styles.attachmentOverlay,
                {
                  opacity: fadeAnim,
                  transform: [{translateY: slideAnim}]
                }
              ]}
            >
              <View style={styles.attachmentOptionsContainer}>
                <TouchableOpacity style={styles.attachmentOption}>
                  <View style={[styles.attachmentIcon, {backgroundColor: '#4CAF50'}]}>
                    <Ionicons name="image" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.attachmentText}>Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.attachmentOption}>
                  <View style={[styles.attachmentIcon, {backgroundColor: '#FF9800'}]}>
                    <Ionicons name="document" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.attachmentText}>Document</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.attachmentOption}>
                  <View style={[styles.attachmentIcon, {backgroundColor: '#E91E63'}]}>
                    <Ionicons name="location" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.attachmentText}>Location</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={toggleAttachmentOptions}
            >
              <Ionicons 
                name={showAttachmentOptions ? "close" : "add"} 
                size={24} 
                color="#002D62" 
              />
            </TouchableOpacity>
            
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
                placeholderTextColor="#999"
              />
              
              <TouchableOpacity style={styles.emojiButton}>
                <Ionicons name="happy-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !messageText.trim() && styles.disabledSendButton
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002D62',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#002D62',
  },
  dateHeaderContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dateHeader: {
    backgroundColor: 'rgba(0,45,98,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  dateHeaderText: {
    color: '#002D62',
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButtonLarge: {
    backgroundColor: '#002D62',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  messageRow: {
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '90%',
  },
  userMessageRow: {
    alignSelf: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMessageContainer: {
    maxWidth: '80%',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    maxWidth: '80%',
    alignItems: 'flex-start',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '100%',
  },
  userMessageBubble: {
    backgroundColor: '#002D62',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  failedMessage: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#333333',
  },
  messageFooter: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  userMessageFooter: {
    justifyContent: 'flex-end',
  },
  otherMessageFooter: {
    justifyContent: 'flex-start',
  },
  messageTime: {
    fontSize: 11,
    color: '#888888',
    marginHorizontal: 4,
  },
  statusContainer: {
    marginLeft: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  retryText: {
    color: '#F44336',
    fontSize: 12,
    marginRight: 4,
  },
  attachmentOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  attachmentOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  attachmentOption: {
    alignItems: 'center',
    margin: 8,
  },
  attachmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentText: {
    fontSize: 14,
    color: '#555',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 16,
    color: '#333',
    minHeight: 40,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#002D62',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: '#AAAAAA',
  },
});

export default ChatScreen;
