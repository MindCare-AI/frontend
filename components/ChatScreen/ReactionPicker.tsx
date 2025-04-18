import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Text } from 'react-native';
import chatService from '../../services/chatService';
import { ReactionType } from '../../types/chat';

const REACTIONS: ReactionType[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'haha', emoji: '😄', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😠', label: 'Angry' },
];

interface ReactionPickerProps {
  messageId: string;
  isVisible: boolean;
  onClose: () => void;
  onReactionSelected: (reaction: string) => void;
  existingReactions?: Record<string, { count: number; users: string[] }>;
}

const ReactionPicker: React.FC<ReactionPickerProps> = ({
  messageId,
  isVisible,
  onClose,
  onReactionSelected,
  existingReactions,
}) => {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const handleReactionPress = async (reaction: ReactionType) => {
    setSelectedReaction(reaction.type);
    
    // If reaction already exists and user has reacted, remove it
    if (existingReactions?.[reaction.type]?.users.includes(messageId)) {
      await chatService.removeReaction(messageId, reaction.type);
    } else {
      await chatService.addReaction(messageId, reaction.type);
    }
    
    onReactionSelected(reaction.type);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          {REACTIONS.map((reaction) => (
            <TouchableOpacity
              key={reaction.type}
              style={[
                styles.reactionButton,
                selectedReaction === reaction.type && styles.selectedReaction,
              ]}
              onPress={() => handleReactionPress(reaction)}
            >
              <Text style={styles.emoji}>{reaction.emoji}</Text>
              <Text style={styles.label}>{reaction.label}</Text>
              {existingReactions?.[reaction.type] && (
                <Text style={styles.count}>
                  {existingReactions[reaction.type].count}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '80%',
  },
  reactionButton: {
    padding: 8,
    alignItems: 'center',
    borderRadius: 8,
    margin: 4,
    backgroundColor: '#f0f0f0',
  },
  selectedReaction: {
    backgroundColor: '#e3f2fd',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  count: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});

export default ReactionPicker;