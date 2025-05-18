import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Text } from 'react-native';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectReaction: (emoji: string) => void;
  position?: { x: number; y: number };
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  visible,
  onClose,
  onSelectReaction,
  position,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        activeOpacity={1}
      >
        <View
          style={[
            styles.container,
            position && {
              top: position.y - 60,
              left: position.x,
            },
          ]}
        >
          {REACTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionButton}
              onPress={() => {
                onSelectReaction(emoji);
                onClose();
              }}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reactionButton: {
    padding: 8,
    borderRadius: 20,
  },
  emojiText: {
    fontSize: 24,
  },
});