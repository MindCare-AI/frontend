//screens/ChatScreen/components/MessageInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, Animated, Platform, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Message } from '../../../types/chat';
import AttachmentPicker from './AttachmentPicker'; // New import for attachments

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
    }
  }, [editMessage]);

  return (
    <View style={styles.containerWrapper}>
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
          <TouchableOpacity 
            style={styles.attachmentButton}
            onPress={() => setShowAttachments(true)} // Open attachment picker
          >
            <Icon name="attach" size={24} color="#007AFF" />
          </TouchableOpacity>
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
          <TouchableOpacity 
            style={[styles.sendButton, editMessage && styles.editSendButton]} 
            onPress={onSend}
          >
            <Icon name={editMessage ? "checkmark" : "send"} size={24} color="white" />
          </TouchableOpacity>
        ) : (
          !editMessage && (
            <TouchableOpacity style={styles.mediaButton}>
              <Icon name="camera" size={24} color="#007AFF" />
            </TouchableOpacity>
          )
        )}
      </View>

      <Text style={styles.characterCounter}>{value.length}/500</Text>

      {/* Attachment Picker */}
      <AttachmentPicker
        visible={showAttachments}
        onClose={() => setShowAttachments(false)}
        onSelect={(attachments) => {
          // Handle selected attachments here
          setShowAttachments(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F8FF',
    borderTopWidth: 1,
    borderTopColor: '#CCE5FF',
  },
  editHeaderText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  editCancelButton: {
    padding: 4,
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
  },
  focusedInput: {
    backgroundColor: '#E5E5E5',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  editInput: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  attachmentButton: {
    padding: 8,
  },
  mediaButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editSendButton: {
    backgroundColor: '#4CD964', // Green color for save/confirm
  },
  characterCounter: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginRight: 16,
    marginTop: 4,
  },
});

export default MessageInput;