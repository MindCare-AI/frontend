import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatTime } from '../../utils/helpers';
import ReactionPicker from './ReactionPicker';
import { useAuth } from '../../contexts/AuthContext'; 
import * as Haptics from 'expo-haptics';

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
}

interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, reaction: string) => void;
  onRemoveReaction: (messageId: string, reaction: string) => void;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
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

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onReaction, 
  onRemoveReaction, 
  onEdit, 
  onDelete
}) => {
  const { user } = useAuth();
  const isUserMessage = message.sender.id === (user?.id || '');
  const hasReactions = message.reactions && message.reactions.length > 0;

  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const actionsOpacityAnim = useRef(new Animated.Value(0)).current;
  const reactionsScaleAnim = useRef(new Animated.Value(0)).current;

  // Entry animation
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

  // Menu toggle animation
  useEffect(() => {
    if (showActions) {
      Animated.timing(actionsOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(actionsOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showActions]);

  useEffect(() => {
    if (hasReactions) {
      Animated.spring(reactionsScaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [hasReactions, message.reactions]);

  const handleLongPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setShowActions(true);
  };

  // Fix reaction handling
  const getReactionCounts = () => {
    if (!message.reactions || message.reactions.length === 0) {
      return [];
    }

    const counts: { [key: string]: number } = {};
    message.reactions.forEach((reaction: { type: string }) => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  };

  const reactionCounts = getReactionCounts();

  // Generate a highlight color based on the message's sender ID for consistent user colors
  const getUserHighlightColor = () => {
    // Safely convert sender ID to string before splitting
    const idStr = String(message.sender.id || '');
    const idSum = idStr
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = idSum % 360;
    return `hsla(${hue}, 70%, 90%, 0.6)`;
  };

  return (
    <Animated.View style={[
      styles.container,
      isUserMessage ? styles.userContainer : styles.otherContainer,
      {
        opacity: opacityAnim,
        transform: [
          { translateY: slideAnim },
        ],
      }
    ]}>
      {message.sender.name && !isUserMessage && (
        <Text style={styles.senderName}>{message.sender.name}</Text>
      )}
      
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity 
          onLongPress={handleLongPress}
          onPress={() => setShowActions(false)}
          activeOpacity={0.9}
          delayLongPress={200}
        >
          <View 
            style={[
              styles.bubble,
              isUserMessage ? styles.userBubble : styles.otherBubble,
              message.isEdited && styles.editedBubble,
              // Apply highlight_color only for other users if provided
              !isUserMessage && message.sender.highlight_color && { backgroundColor: message.sender.highlight_color },
            ]}
          >
            <Text style={[
              styles.messageText,
              isUserMessage ? styles.userText : styles.otherText
            ]}>
              {message.content}
            </Text>
            
            <View style={styles.footer}>
              <Text style={[
                styles.time,
                isUserMessage ? styles.userTime : styles.otherTime
              ]}>
                {formatTime(message.timestamp)}
                {message.isEdited && <Text style={styles.editedText}> (edited)</Text>}
              </Text>
              
              {message.status && isUserMessage && (
                <View style={styles.statusContainer}>
                  {message.status === 'sent' && (
                    <Icon name="checkmark" size={14} color="#A3A3A3" />
                  )}
                  {message.status === 'delivered' && (
                    <Icon name="checkmark-done" size={14} color="#A3A3A3" />
                  )}
                  {message.status === 'read' && (
                    <Icon name="checkmark-done" size={14} color="#4CD964" />
                  )}
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Reactions display */}
      {hasReactions && (
        <Animated.View 
          style={[
            styles.reactionsContainer,
            isUserMessage ? styles.userReactionsContainer : styles.otherReactionsContainer,
            { transform: [{ scale: reactionsScaleAnim }] }
          ]}
        >
          {reactionCounts.map(({ type, count }) => (
            <View key={type} style={styles.reactionBadge}>
              <Text style={styles.reactionEmoji}>
                {REACTION_EMOJI[type] || '👍'}
              </Text>
              {count > 1 && (
                <Text style={styles.reactionCount}>{count}</Text>
              )}
            </View>
          ))}
        </Animated.View>
      )}
      
      {/* Action buttons */}
      {showActions && (
        <Animated.View 
          style={[
            styles.actionsContainer,
            isUserMessage ? styles.userActionsContainer : styles.otherActionsContainer,
            { opacity: actionsOpacityAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => {
              setShowActions(false);
              setShowReactions(true);
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <Icon name="happy-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          {isUserMessage && (
            <>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setShowActions(false); 
                  onEdit(message.id);
                }}
              >
                <Icon name="pencil-outline" size={18} color="#666" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]} 
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  setShowActions(false); 
                  onDelete(message.id);
                }}
              >
                <Icon name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowActions(false)}
          >
            <Icon name="close-outline" size={20} color="#666" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Reaction picker */}
      {showReactions && (
        <View style={[
          styles.reactionPickerContainer,
          isUserMessage ? styles.userReactionPicker : styles.otherReactionPicker
        ]}>
          <ReactionPicker 
            onSelect={(reaction) => {
              setShowReactions(false);
              onReaction(message.id, reaction);
            }} 
            onClose={() => setShowReactions(false)}
          />
        </View>
      )}
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
});

export default MessageBubbleWrapper;