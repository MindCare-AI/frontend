import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MessageBubble } from '../../components/MessagingScreen/MessageBubble';
import { MessageInput } from '../../components/MessagingScreen/MessageInput';
import { TypingIndicator } from '../../components/MessagingScreen/TypingIndicator';
import { FilePreviewModal } from '../../components/MessagingScreen/FilePreviewModal';
import { useMessaging } from '../../contexts/MessagingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Message, MessageAttachment } from '../../types/messaging';
import { globalStyles } from '../../styles/global';
import messagingService from '../../services/messagingService';

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<MessageAttachment | null>(null);
  
  const {
    state: {
      messages: allMessages,
      loadingMessages,
      hasMoreMessages,
      typingIndicators,
      activeConversation
    },
    sendMessage,
    loadMoreMessages,
    startTyping,
    stopTyping,
    markAsRead,
    setActiveConversation,
  } = useMessaging();

  const { conversationId, title } = route.params as { conversationId: string; title: string };
  const messages = allMessages[conversationId] || [];
  const typingUsers = Array.from(typingIndicators || [])
    .filter(indicator => indicator.conversation_id === conversationId);

  useEffect(() => {
    navigation.setOptions({ title });
    setActiveConversation({ 
      id: conversationId,
      name: title
    });

    return () => {
      setActiveConversation(null);
    };
  }, [conversationId, navigation, setActiveConversation, title]);

  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg: Message) => !msg.readBy?.includes(user?.id?.toString() || '')
      );
      unreadMessages.forEach((msg: Message) => markAsRead(msg.id));
    }
  }, [messages, markAsRead, user?.id]);

  const handleSend = async (content: string, attachment?: File) => {
    try {
      await sendMessage(content, attachment);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLoadMore = () => {
    if (hasMoreMessages && !loadingMessages) {
      loadMoreMessages();
    }
  };

  const handleAttachmentPress = (attachment: MessageAttachment) => {
    setSelectedAttachment(attachment);
  };

  const handleReactionPress = async (messageId: string, emoji: string) => {
    try {
      const message = messages.find((m: Message) => m.id === messageId);
      if (!message) return;

      const hasReacted = message.reactions?.some(
        r => r.userId === user?.id?.toString() && r.emoji === emoji
      );

      if (hasReacted) {
        await messagingService.removeReaction(messageId, emoji);
      } else {
        await messagingService.addReaction(messageId, emoji);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const renderMessage = ({ item: message }: { item: Message }) => {
    const isOwn = message.sender_id === user?.id?.toString();

    return (
      <MessageBubble
        text={message.content}
        timestamp={message.timestamp}
        isOwn={isOwn}
        status={message.status}
        senderName={!isOwn ? message.sender_name : undefined}
        attachment={message.attachment}
        reactions={message.reactions}
        edited={message.edited}
        onAttachmentPress={handleAttachmentPress}
        onReactionPress={(emoji) => handleReactionPress(message.id, emoji)}
      />
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingUser = typingUsers[0];
    return <TypingIndicator username={typingUser.username} />;
  };

  const renderFooter = () => {
    if (!loadingMessages) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={globalStyles.colors.primary} />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messageList}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
      {renderTypingIndicator()}
      <MessageInput
        onSend={handleSend}
        onTypingStart={startTyping}
        onTypingEnd={stopTyping}
      />
      <FilePreviewModal
        visible={!!selectedAttachment}
        attachment={selectedAttachment!}
        onClose={() => setSelectedAttachment(null)}
        onError={(error) => {
          setSelectedAttachment(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.backgroundLight,
  },
  messageList: {
    paddingVertical: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
});