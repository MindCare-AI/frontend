import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatTime } from '../../utils/helpers';
import ReactionPicker from './ReactionPicker';
import { useAuth } from '../../contexts/AuthContext'; 
import { Message } from '../../types/chat';


interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, reaction: string) => void;
  onRemoveReaction: (messageId: string, reaction: string) => void; // Still available if needed elsewhere
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

// Enhanced animations and improved layout for reactions and actions
const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onReaction, 
  onRemoveReaction, 
  onEdit, 
  onDelete
}) => {
  const { user } = useAuth();
  const isUserMessage = message.sender.id === (user?.id || '');

  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleLongPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
    setShowActions(true);
  };

  return (
    <View style={[
      styles.container,
      isUserMessage ? styles.userContainer : styles.otherContainer
    ]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity 
          onLongPress={handleLongPress}
          onPress={() => setShowActions(false)}
          activeOpacity={0.9}
        >
          <View style={[
            styles.bubble,
            isUserMessage ? styles.userBubble : styles.otherBubble
          ]}>
            <Text style={isUserMessage ? styles.userText : styles.otherText}>
              {message.content}
            </Text>
            <View style={styles.footer}>
              <Text style={styles.time}>{formatTime(message.timestamp)}</Text>
              {message.status === 'read' && (
                <Icon name="checkmark-done" size={16} color="#4CD964" style={styles.statusIcon} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowReactions(true)}>
            <Icon name="happy-outline" size={20} color="#666" />
          </TouchableOpacity>
          {isUserMessage && (
            <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(message.id)}>
              <Icon name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {showReactions && (
        <ReactionPicker onSelect={(reaction) => onReaction(message.id, reaction)} onClose={() => setShowReactions(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#F0F0F0',
  },
  userText: {
    color: '#FFF',
  },
  otherText: {
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  statusIcon: {
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  actionButton: {
    marginHorizontal: 4,
  },
});

export default MessageBubble;