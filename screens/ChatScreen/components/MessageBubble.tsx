import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatTime } from '../../../utils/helpers';
import ReactionPicker from './ReactionPicker';
import { useAuth } from '../../../contexts/AuthContext'; 
import { Message } from '../../../types/chat';
import EditHistoryModal from './EditHistoryModal';
import ReadReceipts from './ReadReceipts';

interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, reaction: string) => void;
  onRemoveReaction: (messageId: string, reaction: string) => void; // Still available if needed elsewhere
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onReaction, 
  onRemoveReaction, 
  onEdit, 
  onDelete
}) => {
  const { user } = useAuth(); // Get current user
  // Fix: compare message.sender.id with the current user's id instead of a fixed 'user' string
  const isUserMessage = message.sender.id === (user?.id || '');
  
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showEditHistory, setShowEditHistory] = useState(false); // New state for edit history
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleLongPress = () => {
    // Add haptic feedback here if available
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    setShowActions(true);
  };

  const handleReactionSelect = (reaction: string) => {
    onReaction(message.id, reaction);
    setShowReactions(false);
  };

  // Make sure to implement handling for reactions removal, e.g.:
  const handleReactionRemove = (reaction: string) => {
    onRemoveReaction(message.id, reaction);
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
          delayLongPress={200}
        >
          <View style={[
            styles.bubble,
            isUserMessage ? styles.userBubble : styles.otherBubble,
            message.status === 'failed' && styles.failedMessage
          ]}>
            {message.deleted ? (
              <Text style={styles.deletedText}>Message deleted</Text>
            ) : (
              <>
                <Text style={isUserMessage ? styles.userText : styles.otherText}>
                  {message.content}
                </Text>
                <View style={styles.footer}>
                  <Text style={[
                    styles.time,
                    isUserMessage ? styles.userTime : styles.otherTime
                  ]}>
                    {formatTime(message.timestamp)}
                  </Text>
                  {message.edit_history && message.edit_history.length > 0 && (
                    <Text style={[
                      styles.editedText,
                      isUserMessage ? styles.userEditedText : styles.otherEditedText
                    ]}>
                      (edited)
                    </Text>
                  )}
                  {message.status && message.status !== 'failed' && (
                    <Icon 
                      name={message.status === 'read' ? 'checkmark-done' : 'checkmark'} 
                      size={16} 
                      color={message.status === 'read' ? '#4CD964' : (isUserMessage ? '#E0E0E0' : '#666')} 
                      style={styles.statusIcon}
                    />
                  )}
                  {message.status === 'failed' && (
                    <Icon 
                      name="alert-circle" 
                      size={16} 
                      color="#FF3B30" 
                      style={styles.statusIcon}
                    />
                  )}
                  {/* New: Read Receipts */}
                  <ReadReceipts 
                    readBy={((message as any).read_by || []).map((id: string) => ({ id, name: '', read_at: '' }))}
                    isUserMessage={isUserMessage} 
                  />
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Update reactions rendering */}
      {message.reactions && Object.keys(message.reactions).length > 0 && (
        <View style={[
          styles.reactionsContainer,
          isUserMessage ? styles.userReactions : styles.otherReactions
        ]}>
          {Object.entries(message.reactions).map(([reaction, users]) => (
            <TouchableOpacity 
              key={reaction} 
              onPress={() => handleReactionRemove(reaction)}
            >
              <Text style={styles.reaction}>
                {reaction} {Array.isArray(users) ? users.length : 0}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showActions && (
        <View style={[
          styles.actionsContainer,
          isUserMessage ? styles.userActions : styles.otherActions
        ]}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowReactions(true)}
          >
            <Icon name="happy-outline" size={20} color="#666" />
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
                <Icon name="pencil-outline" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  onDelete(message.id);
                  setShowActions(false);
                }}
              >
                <Icon name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
              {/* New: Edit History option */}
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setShowEditHistory(true)}
              >
                <Text style={{ color: '#666', fontSize: 14 }}>View Edit History</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {showReactions && (
        <ReactionPicker 
          onSelect={handleReactionSelect}
          onClose={() => setShowReactions(false)}
        />
      )}

      {/* New: Edit History Modal */}
      <EditHistoryModal
        visible={showEditHistory}
        onClose={() => setShowEditHistory(false)}
        history={(message.edit_history || []).map(item => ({
          content: item.content || '',
          edited_at: item.timestamp || new Date().toISOString(),
          edited_by: { 
            id: message.sender.id || '', 
            name: message.sender.name || '' 
          }
        }))}
        currentContent={message.content}
      />
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
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#0B57D0', // Professional blue for user messages
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: '#F2F2F7', // Light gray for received messages
    borderBottomLeftRadius: 2,
    elevation: 1,
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  otherText: {
    color: '#333333', // Darker text for better readability
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 10,
  },
  userTime: {
    color: '#E0E0E0',
    marginRight: 4,
  },
  otherTime: {
    color: '#666',
    marginRight: 4,
  },
  statusIcon: {
    marginLeft: 4,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userReactions: {
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  otherReactions: {
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  reaction: {
    fontSize: 16,
    marginHorizontal: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
  },
  userActions: {
    alignSelf: 'flex-end',
  },
  otherActions: {
    alignSelf: 'flex-start',
  },
  actionButton: {
    padding: 8,
  },
  failedMessage: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  editedText: {
    fontSize: 10,
    fontStyle: 'italic',
    marginRight: 4,
  },
  userEditedText: {
    color: '#E0E0E0',
  },
  otherEditedText: {
    color: '#666',
  },
  deletedText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#999',
  }
});

export default MessageBubble;