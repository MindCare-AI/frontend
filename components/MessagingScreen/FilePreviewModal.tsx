import React from 'react';
import {
  Modal,
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { X, Download, FileText } from 'lucide-react-native';
import { globalStyles } from '../../styles/global';
import { MessageAttachment } from '../../types/messaging';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface FilePreviewModalProps {
  visible: boolean;
  attachment: MessageAttachment;
  onClose: () => void;
  onError: (error: Error) => void;
}

export function FilePreviewModal({
  visible,
  attachment,
  onClose,
  onError,
}: FilePreviewModalProps) {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    if (!attachment.url) {
      onError(new Error('No file URL provided'));
      return;
    }

    setLoading(true);
    try {
      const filename = attachment.filename || 'download';
      const localUri = `${FileSystem.cacheDirectory}${filename}`;

      const { uri } = await FileSystem.downloadAsync(
        attachment.url,
        localUri
      );

      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (attachment.mime_type?.startsWith('image/')) {
      return (
        <Image
          source={{ uri: attachment.url }}
          style={styles.image}
          resizeMode="contain"
        />
      );
    }

    return (
      <View style={styles.fileContainer}>
        <FileText size={48} color={globalStyles.colors.textPrimary} />
        <Text style={styles.fileName} numberOfLines={2}>
          {attachment.filename}
        </Text>
        <Text style={styles.fileSize}>
          {(attachment.size / 1024).toFixed(1)} KB
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Download size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  closeButton: {
    padding: 8,
  },
  downloadButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
  },
  fileContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  fileName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  fileSize: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
});