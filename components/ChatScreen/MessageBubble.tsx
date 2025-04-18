import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Easing, ActivityIndicator, Modal, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatTime } from '../../utils/helpers';
import ReactionPicker from './ReactionPicker';
import { useAuth } from '../../contexts/AuthContext'; 
import * as Haptics from 'expo-haptics';
import VoiceMessage from './VoiceMessage';

// Update Message interface
export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    highlight_color?: string;
  };
  timestamp: string;
  status: 'sending' | 'sent' | 'failed' | 'read' | 'delivered';
  reactions?: { type: string }[];
  isEdited?: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image' | 'voice' | 'file';
  url: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
}

interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, reaction: string) => void;
  onRemoveReaction: (messageId: string, reaction: string) => void;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  onReactionPress?: (messageId: string, reaction: string) => void;
  onLongPress?: (message: Message) => void;
}

// Map of reaction emoji 
const REACTION_EMOJI: { [key: string]: string } = {
  like: '👍',
  heart: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠'
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onReaction, 
  onRemoveReaction,
  onEdit, 
  onDelete,
  isOwnMessage,
  showAvatar = true,
  onReactionPress,
  onLongPress
}) => {
  const { user } = useAuth();
  const isUserMessage = message.sender.id === (user?.id || '');
  const hasReactions = message.reactions && message.reactions.length > 0;

  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const actionsOpacityAnim = useRef(new Animated.Value(0)).current;
  const reactionsScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowActions(true);
  };

  const toggleReactions = () => {
    setShowReactions(!showReactions);
    Animated.spring(reactionsScaleAnim, {
      toValue: showReactions ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const handleReaction = async (type: string) => {
    try {
      if (message.reactions?.some(r => r.type === type)) {
        await onRemoveReaction(message.id, type);
      } else {
        await onReaction(message.id, type);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const renderMessageStatus = () => {
    switch (message.status) {
      case 'sending':
        return <ActivityIndicator size="small" color="#999" />;
      case 'sent':
        return <Icon name="checkmark" size={16} color="#999" />;
      case 'delivered':
        return <Icon name="checkmark-done" size={16} color="#999" />;
      case 'read':
        return <Icon name="checkmark-done" size={16} color="#4CAF50" />;
      case 'failed':
        return (
          <TouchableOpacity onPress={() => onRetry?.(message.id)}>
            <Icon name="alert-circle" size={16} color="#F44336" />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderAttachment = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <Image
            source={{ uri: attachment.url }}
            style={styles.imageAttachment}
            resizeMode="cover"
          />
        );
      case 'voice':
        return <VoiceMessage audioUrl={attachment.url} duration={attachment.duration} />;
      default:
        return (
          <TouchableOpacity style={styles.fileAttachment}>
            <Text style={styles.fileName}>{attachment.fileName}</Text>
            <Text style={styles.fileSize}>
              {(attachment.fileSize / 1024).toFixed(1)} KB
            </Text>
          </TouchableOpacity>
        );
    }
  };

  const renderReactions = () => {
    if (!message.reactions || Object.keys(message.reactions).length === 0) {
      return null;
    }

    return (
      <View style={styles.reactionsContainer}>
        {Object.entries(message.reactions).map(([emoji, reaction]) => (
          <TouchableOpacity
            key={emoji}
            style={styles.reaction}
            onPress={() => onReactionPress?.(message.id, emoji)}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            <Text style={styles.reactionCount}>{reaction.count}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const messageContainerStyle = [
    styles.container,
    isUserMessage ? styles.userMessage : styles.otherMessage,
  ];

  const messageContentStyle = [
    styles.content,
    isUserMessage ? styles.userContent : styles.otherContent,
    message.status === 'failed' && styles.failedMessage,
  ];

  return (
    <Animated.View
      style={[
        messageContainerStyle,
        {
          opacity: opacityAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onLongPress={handleLongPress}
        delayLongPress={200}
        activeOpacity={0.7}
      >
        <View style={messageContentStyle}>
          <Text style={styles.messageText}>{message.content}</Text>
          
          {message.attachments?.map((attachment, index) => (
            <View key={index} style={styles.attachmentContainer}>
              {renderAttachment(attachment)}
            </View>
          ))}

          <View style={styles.messageFooter}>
            <Text style={styles.timestamp}>
              {formatTime(message.timestamp)}
              {message.isEdited && 
                <Text style={styles.editedText}> (edited)</Text>
              }
            </Text>
            {isUserMessage && renderMessageStatus()}
          </View>
        </View>
      </TouchableOpacity>

      {hasReactions && (
        <Animated.View 
          style={[
            styles.reactionsContainer,
            {
              transform: [{ scale: reactionsScaleAnim }]
            }
          ]}
        >
          {message.reactions.map((reaction, index) => (
            <TouchableOpacity
              key={`${reaction.type}-${index}`}
              style={styles.reactionBubble}
              onPress={() => handleReaction(reaction.type)}
            >
              <Text style={styles.reactionEmoji}>
                {REACTION_EMOJI[reaction.type]}
              </Text>
              <Text style={styles.reactionCount}>
                {reaction.users.length}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionSheet}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                toggleReactions();
                setShowActions(false);
              }}
            >
              <Icon name="heart-outline" size={24} color="#666" />
              <Text style={styles.actionText}>React</Text>
            </TouchableOpacity>

            {isUserMessage && (
              <>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    onEdit(message.id);
                    setShowActions(false);
                  }}
                >
                  <Icon name="pencil" size={24} color="#666" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    onDelete(message.id);
                    setShowActions(false);
                  }}
                >
                  <Icon name="trash" size={24} color="#FF3B30" />
                  <Text style={[styles.actionText, styles.deleteText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      {renderReactions()}
      <ReactionPicker
        messageId={message.id}
        isVisible={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        onReactionSelected={(reaction) => {
          onReactionPress?.(message.id, reaction);
          setShowReactionPicker(false);
        }}
        existingReactions={message.reactions}
      />
    </Animated.View>
  );
};

// Add error boundary to catch rendering issues
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error in MessageBubble:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <Text>Error rendering MessageBubble</Text>;
    }
    return this.props.children;
  }
}

// Wrap MessageBubble with ErrorBoundary
const MessageBubbleWrapper: React.FC<MessageBubbleProps> = (props) => {
  return (
    <ErrorBoundary>
      <MessageBubble {...props} />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '85%',
    minWidth: 80,
  },
  userContainer: {
    alignSelf: 'flex-end',
    marginRight: 12,
  },
  otherContainer: {
    alignSelf: 'flex-start',
    marginLeft: 12,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 2,
    marginLeft: 12,
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    minWidth: 80,
  },
  userBubble: {
    backgroundColor: '#F0F0F0',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
  },
  otherBubble: {
    backgroundColor: '#D1D1D1',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#1F2937',
  },
  editedBubble: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    marginRight: 4,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTime: {
    color: '#666',
  },
  editedText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  statusContainer: {
    marginLeft: 4,
  },
  reactionsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
    }),
  },
  userReactionsContainer: {
    right: 12,
  },
  otherReactionsContainer: {
    left: 12,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: -50,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      },
    }),
  },
  userActionsContainer: {
    right: 0,
  },
  otherActionsContainer: {
    left: 0,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: '#FFEEEE',
  },
  reactionPickerContainer: {
    position: 'absolute',
    top: -60,
    zIndex: 2,
  },
  userReactionPicker: {
    right: 0,
  },
  otherReactionPicker: {
    left: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  actionSheet: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  deleteText: {
    color: '#FF3B30',
  },
  attachmentContainer: {
    marginTop: 8,
  },
  imageAttachment: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  fileAttachment: {
    backgroundColor: '#e3e3e3',
    padding: 8,
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#000',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
});

export default MessageBubbleWrapper;