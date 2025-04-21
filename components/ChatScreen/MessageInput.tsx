//screens/ChatScreen/components/MessageInput.tsx
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Text,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useSharedValue,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { Message } from '../../types/chat';
import { debounce } from '../../utils/helpers';
import { useKeyboard } from '@react-native-community/hooks';
import * as Haptics from 'expo-haptics';
import { useVoiceRecording } from '../../hooks/ChatScreen/useVoiceRecording';
import { PanGestureHandler, GestureEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import AttachmentPicker from './AttachmentPicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MessageInputProps {
  onSendMessage: (content: string, type?: string, metadata?: any) => Promise<void>;
  onTypingStatusChange?: (isTyping: boolean) => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  onSendVoiceMessage: (uri: string) => void;
  onAttachmentsSelected: (attachments: any[]) => void;
}

const CANCEL_THRESHOLD = -150;

interface AttachmentType {
  uri: string;
  type: 'image' | 'file';
  name?: string;
  size?: number;
}

export const MessageInput: React.FC<MessageInputProps> = memo(({
  onSendMessage,
  onTypingStatusChange,
  editingMessage,
  onCancelEdit,
  disabled = false,
  placeholder = 'Type a message...',
  maxLength = 1000,
  onSendVoiceMessage,
  onAttachmentsSelected,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { keyboardHeight, keyboardVisible } = useKeyboard();
  const [showAttachments, setShowAttachments] = useState(false);

  const {
    hasPermission,
    isRecording,
    duration,
    formattedDuration,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecording({
    onRecordingComplete: (uri) => {
      onSendVoiceMessage(uri);
    },
  });

  // Animated values
  const attachmentScale = useSharedValue(1);
  const sendScale = useSharedValue(1);
  const inputHeight = useSharedValue(40);

  // Load draft message from storage if any
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await AsyncStorage.getItem('message_draft');
        if (draft) {
          setText(draft);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    };
    loadDraft();
  }, []);

  // Save draft when component unmounts
  useEffect(() => {
    return () => {
      if (text.trim()) {
        AsyncStorage.setItem('message_draft', text).catch(console.error);
      } else {
        AsyncStorage.removeItem('message_draft').catch(console.error);
      }
    };
  }, [text]);

  // Handle editing message
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  // Debounced typing indicator
  const debouncedTyping = useCallback(
    debounce((isTyping: boolean) => {
      onTypingStatusChange?.(isTyping);
    }, 500),
    [onTypingStatusChange]
  );

  const handleTextChange = (value: string) => {
    setText(value);
    if (value.trim().length > 0) {
      debouncedTyping(true);
    } else {
      debouncedTyping(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const newAttachment = {
          uri: asset.uri,
          type: 'image',
          name: asset.uri.split('/').pop() || 'image.jpg',
          size: asset.fileSize,
        };
        setAttachments(prev => [...prev, newAttachment]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        error.message : 
        'Error selecting image';
      Alert.alert('Upload Error', errorMessage, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Try Again', onPress: pickImage }
      ]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        const document = result.assets[0];
        const newAttachment = {
          uri: document.uri,
          type: 'file',
          name: document.name,
          size: document.size,
        };
        setAttachments(prev => [...prev, newAttachment]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        error.message : 
        'Error selecting document';
      Alert.alert('Upload Error', errorMessage, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Try Again', onPress: pickDocument }
      ]);
    }
  };

  const removeAttachment = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (disabled || (!text.trim() && attachments.length === 0)) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      setIsUploading(true);
      
      // Handle attachments first if any
      if (attachments.length > 0) {
        for (const attachment of attachments) {
          try {
            await onSendMessage('', attachment.type, {
              file_url: attachment.uri,
              file_name: attachment.name,
              file_size: attachment.size,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? 
              error.message : 
              'Failed to upload attachment';
            Alert.alert('Upload Error', errorMessage);
            // Continue with other attachments even if one fails
            continue;
          }
        }
        setAttachments([]);
      }

      // Then send text message if any
      if (text.trim()) {
        await onSendMessage(text.trim());
        setText('');
        AsyncStorage.removeItem('message_draft').catch(console.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        error.message : 
        'Error sending message';
      Alert.alert('Error', errorMessage, [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Retry',
          onPress: handleSend
        }
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePressIn = async () => {
    if (hasPermission) {
      Keyboard.dismiss();
      await startRecording();
    }
  };

  const handlePressOut = async () => {
    if (isRecording) {
      await stopRecording();
    }
  };

  const handleGestureEvent = (event: GestureEvent<PanGestureHandlerEventPayload>) => {
    if (event.nativeEvent.translationX < CANCEL_THRESHOLD) {
      runOnJS(cancelRecording)();
    }
  };

  const attachmentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: attachmentScale.value }],
  }));

  const sendAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    height: inputHeight.value,
  }));

  const recordingIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isRecording ? 1 : 0) },
    ],
    opacity: withTiming(isRecording ? 1 : 0),
  }));

  const attachmentsStyle = useAnimatedStyle(() => ({
    height: withSpring(showAttachments ? 120 : 0),
    opacity: withTiming(showAttachments ? 1 : 0),
  }));

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.attachmentsContainer, attachmentsStyle]}>
          <AttachmentPicker onSelectAttachments={onAttachmentsSelected} />
        </Animated.View>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowAttachments(!showAttachments)}
          >
            <Icon name="attach" size={24} color="#007AFF" />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            multiline
            maxLength={maxLength}
            editable={!disabled && !isRecording}
          />

          {text.trim() ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={disabled}
            >
              <Icon name="send" size={24} color="#007AFF" />
            </TouchableOpacity>
          ) : (
            <PanGestureHandler onGestureEvent={handleGestureEvent}>
              <Animated.View>
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    isRecording && styles.recordingActive,
                  ]}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={disabled || !hasPermission}
                >
                  <Icon
                    name={isRecording ? 'radio' : 'mic'}
                    size={24}
                    color={isRecording ? '#FF3B30' : '#007AFF'}
                  />
                </TouchableOpacity>
              </Animated.View>
            </PanGestureHandler>
          )}
        </View>

        <Animated.View style={[styles.recordingOverlay, recordingIndicatorStyle]}>
          <Icon name="radio" size={24} color="#FF3B30" />
          <Animated.Text style={styles.recordingTime}>
            {formattedDuration}
          </Animated.Text>
          <Animated.Text style={styles.recordingHint}>
            Slide left to cancel
          </Animated.Text>
        </Animated.View>

        {attachments.length > 0 && (
          <ScrollView
            horizontal
            style={styles.attachmentsContainer}
            showsHorizontalScrollIndicator={false}
          >
            {attachments.map((attachment, index) => (
              <View key={index} style={styles.attachmentPreview}>
                {attachment.type === 'image' ? (
                  <Image
                    source={{ uri: attachment.uri }}
                    style={styles.attachmentImage}
                  />
                ) : (
                  <View style={styles.filePreview}>
                    <Icon name="document" size={24} color="#666" />
                    <Text numberOfLines={1} style={styles.fileName}>
                      {attachment.name}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeAttachment}
                  onPress={() => removeAttachment(index)}
                >
                  <Icon name="close-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  editHeaderText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  attachButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    minHeight: 40,
    maxHeight: 120,
  },
  input: {
    fontSize: 16,
    color: '#000',
    lineHeight: 20,
    padding: 0,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  attachmentPreview: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  attachmentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  filePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    maxWidth: 56,
  },
  removeAttachment: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  recordingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  recordingTime: {
    fontSize: 16,
    color: '#FF3B30',
    marginHorizontal: 8,
    minWidth: 50,
    textAlign: 'center',
  },
  recordingHint: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
  },
  recordingActive: {
    backgroundColor: '#FFE5E5',
  },
});

export default MessageInput;