//screens/ChatScreen/components/MessageInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Keyboard, 
  Animated, 
  Platform, 
  Text,
  Easing
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Message } from '../../types/chat';
import AttachmentPicker from './AttachmentPicker'; // New import for attachments
import * as Haptics from 'expo-haptics';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  editMessage?: Message | null;
  onEditCancel: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  value, 
  onChangeText, 
  onSend,
  editMessage,
  onEditCancel
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [showAttachments, setShowAttachments] = useState(false); // New state for attachments
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const editBgAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: 250,
          useNativeDriver: false
        }).start();
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardHeight]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editMessage) {
      inputRef.current?.focus();
      // Animate the background color change
      Animated.timing(editBgAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Reset animation when exiting edit mode
      Animated.timing(editBgAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [editMessage]);

  const handleSend = () => {
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animate the send button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSend();
    });
  };

  const handleAttachmentPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAttachments(true);
    });
  };

  // Calculate the background color based on edit mode
  const containerBackgroundColor = editBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#F0F8FF']
  });
  
  // Calculate the rotation for attachment icon
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  // Length counter color
  const getCounterColor = () => {
    if (value.length >= 450) return '#DC2626'; // Red when close to limit
    if (value.length >= 400) return '#F59E0B'; // Amber when approaching limit
    return '#666666'; // Default gray
  };

  return (
    <Animated.View 
      style={[
        styles.containerWrapper,
        { backgroundColor: containerBackgroundColor }
      ]}
    >
      {editMessage && (
        <View style={styles.editHeader}>
          <Text style={styles.editHeaderText}>Editing Message</Text>
          <TouchableOpacity onPress={onEditCancel} style={styles.editCancelButton}>
            <Icon name="close" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.container}>
        {!editMessage && (
          <Animated.View style={{ transform: [{ rotate }] }}>
            <TouchableOpacity 
              style={styles.attachmentButton}
              onPress={handleAttachmentPress}
            >
              <Icon name="attach" size={24} color="#007AFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            isFocused && styles.focusedInput,
            editMessage && styles.editInput
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={editMessage ? "Edit your message..." : "Type a message..."}
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="default"
          blurOnSubmit={false}
        />
        
        {value ? (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.sendButton, editMessage && styles.editSendButton]} 
              onPress={handleSend}
              activeOpacity={0.7}
            >
              <Icon 
                name={editMessage ? "checkmark" : "send"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          !editMessage && (
            <TouchableOpacity 
              style={styles.mediaButton}
              activeOpacity={0.7}
            >
              <Icon name="camera" size={24} color="#007AFF" />
            </TouchableOpacity>
          )
        )}
      </View>

      <Text style={[
        styles.characterCounter, 
        { color: getCounterColor() }
      ]}>
        {value.length}/500
      </Text>

      {/* Attachment Picker */}
      <AttachmentPicker
        visible={showAttachments}
        onClose={() => setShowAttachments(false)}
        onSelect={(attachments) => {
          // Handle selected attachments here
          setShowAttachments(false);
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 122, 255, 0.2)',
  },
  editHeaderText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  editCancelButton: {
    padding: 4,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
    fontSize: 16,
    marginHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      },
    }),
  },
  focusedInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#007AFF',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 0 0 2px rgba(0,122,255,0.2)',
      },
    }),
  },
  editInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#007AFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  attachmentButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  mediaButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,122,255,0.4)',
      },
    }),
  },
  editSendButton: {
    backgroundColor: '#34C759', // Green color for save/confirm
    ...Platform.select({
      ios: {
        shadowColor: '#34C759',
      },
      web: {
        boxShadow: '0 2px 6px rgba(52,199,89,0.4)',
      },
    }),
  },
  characterCounter: {
    textAlign: 'right',
    fontSize: 12,
    marginRight: 16,
    marginTop: 2,
    marginBottom: 6,
  },
});

export default MessageInput;