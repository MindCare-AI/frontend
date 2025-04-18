import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { MessageStatus } from './MessageStatus';
import { ReadReceipts } from './ReadReceipts';
import { ReactionPicker } from './ReactionPicker';
import { useMessageInteractions } from '../../hooks/ChatScreen/useMessageInteractions';

interface ChatMessageProps {
  message: any;
  isLastInGroup: boolean;
  showAvatar: boolean;
  onLongPress?: (message: any) => void;
  onReactionSelect?: (reaction: string) => void;
}

export const ChatMessage = React.memo(({
  message,
  isLastInGroup,
  showAvatar,
  onLongPress,
  onReactionSelect
}: ChatMessageProps) => {
  const {
    handlePress,
    handleLongPress,
    isSelected,
    reactions,
    handleReactionSelect
  } = useMessageInteractions(message, onLongPress, onReactionSelect);

  const messageStyle = useMemo(() => [
    styles.message,
    message.isSent ? styles.sentMessage : styles.receivedMessage,
    isLastInGroup && styles.lastInGroup
  ], [message.isSent, isLastInGroup]);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
    >
      <View style={messageStyle}>
        <MessageBubble
          content={message.content}
          type={message.type}
          metadata={message.metadata}
          isSent={message.isSent}
          isSelected={isSelected}
        />
        
        {reactions.length > 0 && (
          <View style={styles.reactionsContainer}>
            {reactions.map((reaction) => (
              <ReactionPicker
                key={reaction.id}
                reaction={reaction}
                onSelect={handleReactionSelect}
              />
            ))}
          </View>
        )}
        
        {isLastInGroup && (
          <View style={styles.messageFooter}>
            <MessageStatus 
              status={message.status}
              timestamp={message.timestamp}
            />
            {message.isSent && (
              <ReadReceipts 
                readBy={message.readBy}
                style={styles.readReceipts}
              />
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
});

ChatMessage.displayName = 'ChatMessage';

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  message: {
    maxWidth: '80%',
    flexDirection: 'column',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  lastInGroup: {
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  readReceipts: {
    marginLeft: 4,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
});
