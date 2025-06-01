import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSend?: () => void;
  onSendMessage?: (message: string) => void;
  onTyping?: (isTyping: boolean) => void;
  isConnected?: boolean;
  disabled?: boolean;
  placeholder?: string;
  setValue?: (value: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value: propValue,
  onChangeText,
  onSend,
  onSendMessage,
  onTyping,
  isConnected = true,
  disabled = false,
  placeholder = 'Type a message...',
  setValue: setPropValue
}) => {
  const [internalValue, setInternalValue] = useState('');
  const inputRef = useRef<TextInput>(null);
  const [inputHeight, setInputHeight] = useState(40);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use provided value or internal state
  const value = propValue !== undefined ? propValue : internalValue;
  
  const handleChangeText = (text: string) => {
    if (onChangeText) {
      onChangeText(text);
    }
    
    if (setPropValue) {
      setPropValue(text);
    } else {
      setInternalValue(text);
    }
    
    // Handle typing indicator
    if (onTyping && text.length > 0) {
      onTyping(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to indicate user stopped typing after 1.5 seconds
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  };

  const handleSend = () => {
    if (value && value.trim().length > 0 && !disabled) {
      if (onSend) {
        onSend();
      }
      
      if (onSendMessage) {
        onSendMessage(value.trim());
      }
      
      // Reset text input
      if (setPropValue) {
        setPropValue('');
      } else {
        setInternalValue('');
      }
      
      if (onTyping) {
        onTyping(false);
      }
    }
  };

  const handleContentSizeChange = (event: any) => {
    const newHeight = Math.min(Math.max(40, event.nativeEvent.contentSize.height), 100);
    setInputHeight(newHeight);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, (!isConnected || disabled) && styles.inputDisabled]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { height: inputHeight }]}
          value={value || ''}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9E9E9E"
          multiline
          onContentSizeChange={handleContentSizeChange}
          editable={isConnected && !disabled}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!value || !value.trim() || !isConnected || disabled) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!value || !value.trim() || !isConnected || disabled}
        >
          <Ionicons name="send" size={20} color={!value || !value.trim() || !isConnected || disabled ? "#9E9E9E" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    color: '#212121',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});

export default MessageInput;