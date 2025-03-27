//screens/ChatScreen/ChatScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNetInfo } from '@react-native-community/netinfo';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import useChatMessages from './hooks/useChatMessages';
import useMessageActions from './hooks/useMessageActions';
import MessageBubble from './components/MessageBubble';
import MessageInput from './components/MessageInput';
import ChatHeader from './components/ChatHeader';
import TypingIndicator from './components/TypingIndicator';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { Message } from '../../types/chat';
import { useAuth } from '../../contexts/AuthContext';

type ChatRouteProp = RouteProp<MessagingStackParamList, 'Chat'>;
type ChatNavigationProp = StackNavigationProp<MessagingStackParamList, 'Chat'>;

interface ChatScreenProps {
  route: ChatRouteProp;
  navigation: ChatNavigationProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { conversationId, conversationType, title} = route.params;
  const { user } = useAuth();
  const netInfo = useNetInfo();
  const [isRetrying, setIsRetrying] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Validate navigation parameters
  useEffect(() => {
    if (!conversationId || !conversationType || !title) {
      console.error('Invalid navigation parameters:', route.params);
      navigation.goBack();
    }
  }, [conversationId, conversationType, title, navigation]);

  // Debug: Verify navigation parameters
  useEffect(() => {
    console.log('ChatScreen opened with:', conversationId, conversationType, title);
  }, []);

  const {
    messages,
    loading,
    error,
    inputText,
    handleSend,
    setInputText,
    isTyping,
    loadMessages,
    loadMoreMessages,
    conversation,
    hasMore,
    deleteMessage: deleteMessageApi,
    editMessage: editMessageApi,
  } = useChatMessages({
    conversationId: String(conversationId),
    conversationType,
  });

  const { handleReactionSelect, removeReaction } = useMessageActions({
    conversationId: String(conversationId),
    conversationType,
  });

  const handleReaction = useCallback(
    async (messageId: string, reaction: string) => {
      try {
        await handleReactionSelect(reaction);
      } catch (error) {
        console.error('Failed to add reaction:', error);
        Alert.alert('Error', 'Failed to add reaction');
      }
    },
    [handleReactionSelect]
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessageApi(messageId);
            } catch (error) {
              console.error('Failed to delete message:', error);
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]);
    },
    [deleteMessageApi]
  );

  const handleEditMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (message) {
        setEditingMessage(message);
        setInputText(message.content);
      }
    },
    [messages, setInputText]
  );

  const handleSaveEdit = useCallback(async () => {
    if (!editingMessage) return;
    
    try {
      await editMessageApi(editingMessage.id, inputText);
      setEditingMessage(null);
      setInputText('');
    } catch (error) {
      console.error('Failed to update message:', error);
      Alert.alert('Error', 'Failed to update message');
    }
  }, [editingMessage, inputText, editMessageApi]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setInputText('');
  }, []);

  useEffect(() => {
    if (error && !isRetrying) {
      Alert.alert('Error', 'Failed to load messages. Would you like to retry?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: async () => {
            setIsRetrying(true);
            try {
              await loadMessages();
            } finally {
              setIsRetrying(false);
            }
          },
        },
      ]);
    }
  }, [error, isRetrying, loadMessages]);

  useEffect(() => {
    if (!netInfo.isConnected && netInfo.isInternetReachable === false) {
      Alert.alert(
        'No Connection',
        'You are currently offline. Messages will be sent when you reconnect.'
      );
    }
  }, [netInfo.isConnected, netInfo.isInternetReachable]);

  const renderFooter = () => {
    if ((loading && hasMore) || isRetrying) {
      return <ActivityIndicator style={styles.loader} color="#007AFF" size="small" />;
    }
    return null;
  };

  if (loading && !messages.length) {
    return <LoadingIndicator />;
  }
  
  return (
    <View style={styles.container}>
      <ChatHeader conversation={conversation} />
      
      {error && !loading && (
        <ErrorMessage message="Couldn't load all messages" onRetry={loadMessages} />
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <MessageBubble 
              message={item} 
              onReaction={handleReaction}
              onRemoveReaction={removeReaction}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          )}
          keyExtractor={(item) => item.id}
          inverted
          onEndReached={hasMore ? loadMoreMessages : null}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
        />
        
        <TypingIndicator visible={isTyping} />
        
        <MessageInput
          value={inputText}
          onChangeText={setInputText}
          onSend={editingMessage ? handleSaveEdit : handleSend}
          editMessage={editingMessage}
          onEditCancel={handleCancelEdit}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loader: {
    marginVertical: 20,
  },
});

export default ChatScreen;