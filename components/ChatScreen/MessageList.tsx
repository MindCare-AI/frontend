import React, { useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Message } from '../../types/chat';
import MessageGroup from './MessageGroup';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onLoadMore: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onReactionPress?: (messageId: string, reaction: string) => void;
  onMessageLongPress?: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onLoadMore,
  onRefresh,
  isRefreshing = false,
  onReactionPress,
  onMessageLongPress,
}) => {
  const flatListRef = useRef<FlatList>(null);

  const groupMessages = useCallback((msgs: Message[]) => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];
    let currentSenderId: string | null = null;
    let currentDate: string | null = null;

    msgs.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString();
      
      if (
        currentSenderId !== message.senderId ||
        currentDate !== messageDate ||
        currentGroup.length >= 5
      ) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [message];
        currentSenderId = message.senderId;
        currentDate = messageDate;
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, []);

  const renderMessageGroup = useCallback(
    ({ item: group }: { item: Message[] }) => {
      return (
        <MessageGroup
          messages={group}
          isOwnMessage={group[0].senderId === currentUserId}
          onReactionPress={onReactionPress}
          onMessageLongPress={onMessageLongPress}
        />
      );
    },
    [currentUserId, onReactionPress, onMessageLongPress]
  );

  const getGroupKey = useCallback((group: Message[]) => {
    return `${group[0].id}-group`;
  }, []);

  const messageGroups = groupMessages(messages);

  return (
    <FlatList
      ref={flatListRef}
      data={messageGroups}
      renderItem={renderMessageGroup}
      keyExtractor={getGroupKey}
      style={styles.container}
      inverted
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={21}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MessageList;