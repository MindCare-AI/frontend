import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  Animated,
  Modal,
  Text,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface MessageInputProps {
  onSend: (message: string, type?: string) => void;
  conversationType: 'one_to_one' | 'group';
  onTyping?: () => void;
}

// Define a type that includes all the icon names we need
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSend, 
  conversationType,
  onTyping
}) => {
  const [message, setMessage] = useState('');
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };
  
  const handleAttachment = () => {
    setAttachmentMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const closeAttachmentMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setAttachmentMenuVisible(false);
    });
  };
  
  const handleTextChange = (text: string) => {
    setMessage(text);
    if (onTyping) {
      onTyping();
    }
  };
  
  const pickImage = async () => {
    closeAttachmentMenu();
    try {
      setIsAttaching(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Here you would typically upload the image to your server
        // For now we'll just add a placeholder message
        onSend(`[Image: ${asset.uri.split('/').pop()}]`, 'image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to attach image');
      console.error('Image picker error:', error);
    } finally {
      setIsAttaching(false);
    }
  };
  
  const takePhoto = async () => {
    closeAttachmentMenu();
    
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera permissions to take a photo');
      return;
    }
    
    try {
      setIsAttaching(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Here you would typically upload the image to your server
        onSend(`[Photo: ${new Date().toISOString()}]`, 'image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    } finally {
      setIsAttaching(false);
    }
  };
  
  const pickDocument = async () => {
    closeAttachmentMenu();
    
    try {
      setIsAttaching(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false) {
        // Here you would typically upload the document to your server
        onSend(`[File: ${result.assets[0].name}]`, 'file');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to attach document');
      console.error('Document picker error:', error);
    } finally {
      setIsAttaching(false);
    }
  };
  
  // Fix the icon names to be compatible with TypeScript
  const attachmentOptions = [
    { 
      icon: 'image-outline' as IconName, 
      title: 'Photos & Videos', 
      color: '#4CAF50',
      onPress: pickImage 
    },
    { 
      icon: 'camera-outline' as IconName, 
      title: 'Take Photo', 
      color: '#2196F3',
      onPress: takePhoto 
    },
    { 
      icon: 'document-text-outline' as IconName, // Changed from document-outline to document-text-outline
      title: 'Document', 
      color: '#FF9800',
      onPress: pickDocument 
    },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.attachmentButton}
        onPress={handleAttachment}
      >
        <Ionicons name="add-circle-outline" size={24} color="#007BFF" />
      </TouchableOpacity>
      
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={message}
        onChangeText={handleTextChange}
        placeholder={conversationType === 'group' ? "Message group..." : "Type a message..."}
        multiline
        maxLength={1000}
      />
      
      <TouchableOpacity 
        style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} 
        onPress={handleSend}
        disabled={!message.trim()}
      >
        <Ionicons 
          name="send" 
          size={20} 
          color={message.trim() ? "#FFF" : "#CCC"} 
        />
      </TouchableOpacity>
      
      {isAttaching && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      )}
      
      <Modal
        visible={attachmentMenuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeAttachmentMenu}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeAttachmentMenu}
        >
          <Animated.View 
            style={[
              styles.attachmentMenu,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.handle} />
            <Text style={styles.attachmentMenuTitle}>Attach</Text>
            
            <FlatList
              data={attachmentOptions}
              keyExtractor={(item, index) => index.toString()}
              horizontal={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.attachmentOption}
                  onPress={item.onPress}
                >
                  <View style={[styles.attachmentIconContainer, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.attachmentOptionText}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 10,
    paddingTop: 10, // Ensure consistent padding for multiline
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    maxHeight: 100, // Limit height for very long messages
  },
  sendButton: {
    backgroundColor: '#007BFF',
    borderRadius: 25, // Make it round
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: 300,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#DDD',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  attachmentMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  attachmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  attachmentOptionText: {
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  }
});

export default MessageInput;