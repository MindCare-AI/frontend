// screens/ChatScreen/components/AttachmentPicker.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Text, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';

// Define the DocumentPickerResponse interface
interface DocumentPickerResponse {
  uri: string;
  type: string;
  name?: string;
  size?: number;
  fileCopyUri?: string;
}

// Only import DocumentPicker when on native platforms
const DocumentPicker = Platform.OS !== 'web' ? require('react-native-document-picker') : null;

interface Attachment {
  uri: string;
  type: string;
  name?: string;
}

interface AttachmentPickerProps {
  onSelect: (attachments: Attachment[]) => void;
  visible: boolean;
  onClose: () => void;
}

const AttachmentPicker: React.FC<AttachmentPickerProps> = ({ onSelect, visible, onClose }) => {
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'mixed',
        quality: 1,
        selectionLimit: 5,
      });

      if (!result.didCancel && result.assets) {
        const attachments = result.assets.map(asset => ({
          uri: asset.uri || '',
          type: asset.type || 'image',
          name: asset.fileName == null ? undefined : asset.fileName,
        }));
        onSelect(attachments);
      }
      onClose();
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  const pickDocument = async () => {
    if (Platform.OS === 'web') {
      console.warn("DocumentPicker is not supported on web");
      onClose();
      return;
    }
    
    try {
      // Verify DocumentPicker is available
      if (!DocumentPicker) {
        console.warn("DocumentPicker is not available on this platform");
        onClose();
        return;
      }
      
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });

      const attachments = result.map((file: DocumentPickerResponse) => ({
        uri: file.uri,
        type: file.type || 'file',
        name: file.name == null ? undefined : file.name,
      }));
      onSelect(attachments);
      onClose();
    } catch (error) {
      if (DocumentPicker && !DocumentPicker.isCancel(error)) {
        console.error('Document picker error:', error);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.option} onPress={pickImage}>
            <Icon name="image" size={24} color="#007AFF" />
            <Text style={styles.optionText}>Photo or Video</Text>
          </TouchableOpacity>
          {Platform.OS !== 'web' && (
            <TouchableOpacity style={styles.option} onPress={pickDocument}>
              <Icon name="document" size={24} color="#007AFF" />
              <Text style={styles.optionText}>File</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.option} onPress={onClose}>
            <Icon name="close" size={24} color="#FF3B30" />
            <Text style={styles.optionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
});

export default AttachmentPicker;