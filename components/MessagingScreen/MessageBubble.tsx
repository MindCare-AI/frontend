import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Pressable,
} from 'react-native';
import { FileText, CheckCheck, Check } from 'lucide-react-native';
import { globalStyles } from '../../styles/global';
import { MessageAttachment, MessageReaction } from '../../types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { ReactionPicker } from './ReactionPicker';

interface MessageBubbleProps {
  text: string;
  timestamp: string;
  isOwn: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  senderName?: string;
  attachment?: MessageAttachment;
  reactions?: MessageReaction[];
  edited?: boolean;
  onAttachmentPress?: (attachment: MessageAttachment) => void;
  onReactionPress?: (emoji: string) => void;
  onLongPress?: () => void;
}

export function MessageBubble({
  text,
  timestamp,
  isOwn,
  status = 'sent',
  senderName,
  attachment,
  reactions,
  edited,
  onAttachmentPress,
  onReactionPress,
  onLongPress,
}: MessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleLongPress = () => {
    setShowReactionPicker(true);
    onLongPress?.();
  };

  const handleReactionSelect = (emoji: string) => {
    onReactionPress?.(emoji);
  };

  const renderAttachment = () => {
    if (!attachment) return null;

    if (attachment.mime_type.startsWith('image/')) {
      return (
        <TouchableOpacity
          onPress={() => onAttachmentPress?.(attachment)}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: attachment.url }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.fileContainer}
        onPress={() => onAttachmentPress?.(attachment)}
      >
        <FileText size={24} color={isOwn ? '#FFF' : '#000'} />
        <View style={styles.fileInfo}>
          <Text
            style={[styles.fileName, isOwn && styles.ownText]}
            numberOfLines={1}
          >
            {attachment.filename}
          </Text>
          <Text style={[styles.fileSize, isOwn && styles.ownText]}>
            {(attachment.size / 1024).toFixed(1)} KB
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStatus = () => {
    switch (status) {
      case 'sending':
        return <Check size={16} color={isOwn ? '#FFF' : '#666'} />;
      case 'sent':
        return <Check size={16} color={isOwn ? '#FFF' : '#666'} />;
      case 'delivered':
        return <CheckCheck size={16} color={isOwn ? '#FFF' : '#666'} />;
      case 'read':
        return <CheckCheck size={16} color={globalStyles.colors.primary} />;
      case 'failed':
        return <Text style={styles.failedText}>Failed</Text>;
      default:
        return null;
    }
  };

  const renderReactions = () => {
    if (!reactions?.length) return null;

    const reactionCounts = reactions.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <View style={[styles.reactionsContainer, isOwn && styles.ownReactionsContainer]}>
        {Object.entries(reactionCounts).map(([emoji, count]) => (
          <TouchableOpacity
            key={emoji}
            style={styles.reactionBubble}
            onPress={() => handleReactionSelect(emoji)}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            <Text style={styles.reactionCount}>{count}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      {!isOwn && senderName && (
        <Text style={styles.senderName}>{senderName}</Text>
      )}
      <Pressable
        style={[
          styles.bubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
          attachment && styles.attachmentBubble,
        ]}
        onLongPress={handleLongPress}
      >
        {renderAttachment()}
        {text && (
          <Text style={[styles.text, isOwn && styles.ownText]}>
            {text}
            {edited && <Text style={styles.editedText}> (edited)</Text>}
          </Text>
        )}
        <View style={styles.footer}>
          <Text
            style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}
          >
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </Text>
          {isOwn && <View style={styles.statusContainer}>{renderStatus()}</View>}
        </View>
      </Pressable>
      {renderReactions()}
      <ReactionPicker
        visible={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        onSelectReaction={handleReactionSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 8,
    maxWidth: '85%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: globalStyles.colors.textSecondary,
    marginBottom: 2,
    marginLeft: 12,
  },
  bubble: {
    borderRadius: 16,
    padding: 8,
    paddingVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  ownBubble: {
    backgroundColor: globalStyles.colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
  },
  attachmentBubble: {
    padding: 4,
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
  ownText: {
    color: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: globalStyles.colors.textSecondary,
  },
  statusContainer: {
    marginLeft: 4,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  image: {
    width: 200,
    height: 150,
    backgroundColor: '#F0F0F0',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginBottom: 4,
  },
  fileInfo: {
    marginLeft: 8,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  failedText: {
    fontSize: 12,
    color: globalStyles.colors.error,
  },
  editedText: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  ownReactionsContainer: {
    justifyContent: 'flex-end',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  reactionEmoji: {
    fontSize: 12,
    marginRight: 2,
  },
  reactionCount: {
    fontSize: 11,
    color: globalStyles.colors.textSecondary,
  },
});