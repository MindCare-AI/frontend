import React, { useState, useCallback, useRef, memo } from 'react';
import { View, KeyboardAvoidingView, Alert, InteractionManager } from 'react-native';
import { globalStyles } from '../../styles/global';
import Animated, { FadeIn, Layout, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import { Message } from '../../types/chat';
import { useChatMessages } from '../../hooks/ChatScreen/useChatMessages';
import { useChat } from '../../contexts/ChatContext';
import MessageBubble from '../../components/ChatScreen/MessageBubble';
import MessageInput from '../../components/ChatScreen/MessageInput';
import ChatHeader from '../../components/ChatScreen/ChatHeader';
import OfflineNotice from '../../components/ui/OfflineNotice';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import ErrorRetry from '../../components/ui/ErrorRetry';
import { StyleSheet } from 'react-native';

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { conversationId, conversationType } = route.params;
  const netInfo = useNetInfo();
  const listRef = useRef<FlashList<Message>>(null);
  const lastMessageRef = useRef<string | null>(null);
  const scrollY = useSharedValue(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    messages,
    isLoading,
    error,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMore,
    refresh,
    connectionStatus,
  } = useChatMessages({
    conversationId,
    conversationType,
  });

  const { setTypingStatus, markAsRead } = useChat();

  // Optimized scroll handler using Reanimated
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Memoized render item for better performance
  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    // normalize any "audio" attachment to "file"
    const msg: Message = {
      ...item,
      attachments: item.attachments?.map(a => ({
        ...a,
        type: a.type === 'audio' ? 'file' : a.type,
      })),
    };

    const isFirstInSequence = index === 0 || 
      messages[index - 1]?.sender.id !== item.sender.id;
    const isLastInSequence = index === messages.length - 1 || 
      messages[index + 1]?.sender.id !== item.sender.id;

    return (
      <MessageBubble
        message={msg}
        isFirstInSequence={isFirstInSequence}
        isLastInSequence={isLastInSequence}
        showAvatar={isLastInSequence}
        onReaction={(messageId, reaction) => {
          // Handle reaction
        }}
        onEdit={async (messageId, newContent) => {
          if (typeof newContent === 'string') {
            await editMessage(messageId, newContent);
          }
          // Handle edit
        }}
        onDelete={(messageId) => {
          Alert.alert(
            'Delete Message',
            'Are you sure you want to delete this message?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteMessage(messageId),
              },
            ]
          );
        }}
      />
    );
  }, [messages, deleteMessage]);

  const renderItem = ({ item, index }: { item: Message; index: number }) => (
    <Animated.View entering={FadeIn} layout={Layout}>
      {renderMessage({ item, index })}
    </Animated.View>
  );

  // Handle sending new messages
  const handleSend = useCallback(async (content: string, type?: string, metadata?: any) => {
    if (!netInfo.isConnected) {
      Alert.alert('No Connection', 'Unable to send message while offline');
      return;
    }

    try {
      await sendMessage(content);
      
      // Scroll to bottom after sending
      InteractionManager.runAfterInteractions(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      Alert.alert('Error', errorMessage, [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Retry', 
          onPress: () => handleSend(content, type, metadata) 
        }
      ]);
    }
  }, [netInfo.isConnected, sendMessage]);

  // Handle typing status
  const handleTypingStatus = useCallback((isTyping: boolean) => {
    setTypingStatus(conversationId, isTyping);
  }, [conversationId, setTypingStatus]);

  // Mark messages as read when screen is focused
  useFocusEffect(
    useCallback(() => {
      const markMessagesAsRead = async () => {
        if (messages.length > 0 && lastMessageRef.current !== messages[0].id) {
          await markAsRead(conversationId);
          lastMessageRef.current = messages[0].id;
        }
      };

      markMessagesAsRead();
    }, [messages, conversationId, markAsRead])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  if (isLoading && !isRefreshing) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <ErrorRetry
        message="Couldn't load messages"
        onRetry={refresh}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ChatHeader
        conversationId={conversationId}
        conversationType={conversationType}
        connectionStatus={connectionStatus}
      />
      
      {!netInfo.isConnected && <OfflineNotice />}

      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={'padding'}
        keyboardVerticalOffset={88}
      >
        <Animated.View style={{
          flex: 1,
        }}>
          <FlashList
            ref={listRef}
            data={messages}
            renderItem={renderItem}
            estimatedItemSize={100}
            inverted
            onScroll={scrollHandler}            
            onEndReached={hasMore ? loadMore : undefined}
            onEndReachedThreshold={0.5}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: globalStyles.spacing.md, paddingVertical: globalStyles.spacing.sm }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            maxToRenderPerBatch={10}
            windowSize={21}
          />
        </Animated.View>

        <MessageInput
          onSendMessage={handleSend}
          onTypingStatusChange={handleTypingStatus}
          onSendVoiceMessage={async (uri) => {/* Implement voice message handling */}}
          onAttachmentsSelected={(attachments) => {/* Implement attachments handling */}}  
          disabled={!netInfo.isConnected}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});

export default memo(ChatScreen);