import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Send, Paperclip } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { globalStyles } from '../../styles/global';
import { debounce } from '../../utils/helpers';

interface MessageInputProps {
  onSend: (content: string, attachment?: File) => Promise<void>;
  onTypingStart: () => void;
  onTypingEnd: () => void;
}

export function MessageInput({
  onSend,
  onTypingStart,
  onTypingEnd,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const debouncedTypingEnd = useRef(
    debounce(() => {
      onTypingEnd();
    }, 1000)
  ).current;

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (value: string) => {
    setText(value);
    if (value.length > 0) {
      onTypingStart();
      debouncedTypingEnd();
    }
  };

  const handleSend = async () => {
    const trimmedText = text.trim();
    if ((!trimmedText && !attachment) || sending) return;

    setSending(true);
    try {
      await onSend(trimmedText, attachment || undefined);
      setText('');
      setAttachment(null);
      onTypingEnd();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleAttachment = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      // Handle permission denied
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], 'attachment', {
          type: blob.type,
        });
        setAttachment(file);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const file = new File([blob], asset.name, {
          type: asset.mimeType,
        });
        setAttachment(file);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.attachmentButton}
        onPress={handleAttachment}
        disabled={sending}
      >
        <Paperclip
          size={24}
          color={sending ? globalStyles.colors.textSecondary : globalStyles.colors.textPrimary}
        />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
          editable={!sending}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          (!text.trim() && !attachment) && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={(!text.trim() && !attachment) || sending}
      >
        {sending ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Send size={20} color="#FFF" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  attachmentButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: globalStyles.colors.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    maxHeight: 120,
  },
  input: {
    fontSize: 16,
    color: globalStyles.colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: globalStyles.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: globalStyles.colors.textSecondary,
  },
});