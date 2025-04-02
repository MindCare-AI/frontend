//screens/ChatScreen/components/ReactionPicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ReactionPickerProps {
  onSelect: (reaction: string) => void;
  onClose: () => void;
}

// Mapping backend reaction keys to emoji representations
const REACTION_MAP: { [key: string]: string } = {
  like: '👍',
  heart: '❤️',
  smile: '😄',
  thumbsup: '👍'
};

const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect, onClose }) => {
  return (
    <View style={styles.container}>
      {Object.entries(REACTION_MAP).map(([key, emoji]) => (
        <TouchableOpacity 
          key={key} 
          style={styles.reactionButton}
          onPress={() => onSelect(key)}
        >
          <Text style={styles.reactionText}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  reactionButton: {
    padding: 6,
    borderRadius: 20,
  },
  reactionText: {
    fontSize: 20,
  }
});

export default ReactionPicker;