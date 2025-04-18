import React, { memo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
} from 'react-native-reanimated';
import { formatFileSize, isImageFile } from '../../utils/helpers';
import * as Haptics from 'expo-haptics';

interface AttachmentPickerProps {
  onSelectAttachments: (attachments: Array<{
    uri: string;
    type: 'image' | 'file';
    name?: string;
    size?: number;
  }>) => void;
  maxSize?: number; // in bytes
  maxCount?: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AttachmentPicker = memo(({
  onSelectAttachments,
  maxSize = MAX_FILE_SIZE,
  maxCount = 10,
}: AttachmentPickerProps) => {
  const [selectedFiles, setSelectedFiles] = useState<Array<{
    uri: string;
    type: 'image' | 'file';
    name?: string;
    size?: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxCount - selectedFiles.length,
      });

      if (!result.canceled) {
        const validAssets = result.assets.filter(asset => 
          !asset.fileSize || asset.fileSize <= maxSize
        );

        if (validAssets.length < result.assets.length) {
          // Show warning about skipped files
          console.warn('Some files were too large and were skipped');
        }

        const newAttachments = validAssets.map(asset => ({
          uri: asset.uri,
          type: 'image' as const,
          name: asset.fileName || 'image.jpg',
          size: asset.fileSize,
        }));

        setSelectedFiles(prev => [...prev, ...newAttachments]);
        onSelectAttachments(newAttachments);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const attachment = {
          uri: result.uri,
          type: 'file' as const,
          name: result.name,
          size: result.size,
        };

        if (attachment.size && attachment.size > maxSize) {
          console.warn('File is too large');
          return;
        }

        setSelectedFiles(prev => [...prev, attachment]);
        onSelectAttachments([attachment]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const removeAttachment = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      onSelectAttachments(newFiles);
      return newFiles;
    });
  };

  const renderAttachmentPreview = (
    attachment: {
      uri: string;
      type: 'image' | 'file';
      name?: string;
      size?: number;
    },
    index: number
  ) => {
    return (
      <Animated.View
        key={attachment.uri}
        entering={SlideInRight}
        exiting={SlideOutRight}
        style={styles.previewContainer}
      >
        {attachment.type === 'image' ? (
          <Image
            source={{ uri: attachment.uri }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.filePreview}>
            <Icon name="document" size={24} color="#666" />
            <Text numberOfLines={1} style={styles.fileName}>
              {attachment.name}
            </Text>
            {attachment.size && (
              <Text style={styles.fileSize}>
                {formatFileSize(attachment.size)}
              </Text>
            )}
          </View>
        )}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeAttachment(index)}
        >
          <Icon name="close-circle" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const launchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const attachment = {
          uri: result.assets[0].uri,
          type: 'image' as const,
          name: 'camera_photo.jpg',
          size: result.assets[0].fileSize,
        };
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelectAttachments([attachment]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleImagePick}
          disabled={selectedFiles.length >= maxCount || isLoading}
        >
          <Icon name="image" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleDocumentPick}
          disabled={selectedFiles.length >= maxCount || isLoading}
        >
          <Icon name="document" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={launchCamera}
          disabled={selectedFiles.length >= maxCount || isLoading}
        >
          <Icon name="camera" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {selectedFiles.length > 0 && (
        <Animated.ScrollView
          horizontal
          style={styles.previewScroll}
          showsHorizontalScrollIndicator={false}
          entering={FadeIn}
          exiting={FadeOut}
        >
          {selectedFiles.map((file, index) => 
            renderAttachmentPreview(file, index)
          )}
        </Animated.ScrollView>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#007AFF" />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  previewScroll: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  previewContainer: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  imagePreview: {
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
    padding: 4,
  },
  fileName: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    maxWidth: 56,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 9,
    color: '#999',
    marginTop: 2,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AttachmentPicker;