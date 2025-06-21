import React, { useState } from 'react';
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles } from '../../styles/global';

export interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  editable?: boolean;
  onAvatarChange?: (uri: string) => void;
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name = '',
  size = 'md',
  onPress,
  editable = false,
  onAvatarChange,
  style
}) => {
  const [imageError, setImageError] = useState(false);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);

  const getSize = () => {
    switch (size) {
      case 'sm': return 32;
      case 'lg': return 64;
      case 'xl': return 96;
      default: return 48; // md
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const containerSize = getSize();
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 18 : size === 'xl' ? 24 : 14;

  const handleAvatarPress = () => {
    if (editable && onAvatarChange) {
      setShowImageSourceModal(true);
    } else if (onPress) {
      onPress();
    }
  };

  const handleImageFromLibrary = async () => {
    setShowImageSourceModal(false);
    
    if (!onAvatarChange) return;

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access photo library is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        onAvatarChange(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleImageFromCamera = async () => {
    setShowImageSourceModal(false);
    
    if (!onAvatarChange) return;

    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access camera is required.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        onAvatarChange(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const containerStyles = [
    styles.container,
    {
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
    },
    style
  ];

  return (
    <>
      <TouchableOpacity
        style={containerStyles}
        onPress={handleAvatarPress}
        disabled={!onPress && !editable}
        activeOpacity={onPress || editable ? 0.7 : 1}
      >
        {source && !imageError ? (
          <Image
            source={{ uri: source }}
            style={[styles.image, { borderRadius: containerSize / 2 }]}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.fallback, { borderRadius: containerSize / 2 }]}>
            <Text style={[styles.initials, { fontSize }]}>
              {name ? getInitials(name) : '?'}
            </Text>
          </View>
        )}
        
        {editable && (
          <View style={[styles.editIcon, { 
            bottom: size === 'xl' ? 4 : size === 'lg' ? 2 : 0,
            right: size === 'xl' ? 4 : size === 'lg' ? 2 : 0,
          }]}>
            <Ionicons 
              name="camera" 
              size={size === 'xl' ? 16 : size === 'lg' ? 14 : 12} 
              color={globalStyles.colors.white} 
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Image Source Selection Modal */}
      <Modal
        visible={showImageSourceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageSourceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Photo Source</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleImageFromCamera}>
              <Ionicons name="camera" size={24} color={globalStyles.colors.primary} />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleImageFromLibrary}>
              <Ionicons name="images" size={24} color={globalStyles.colors.primary} />
              <Text style={styles.modalOptionText}>Choose from Library</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalOption, styles.cancelOption]} 
              onPress={() => setShowImageSourceModal(false)}
            >
              <Ionicons name="close" size={24} color={globalStyles.colors.error} />
              <Text style={[styles.modalOptionText, styles.cancelText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: globalStyles.colors.neutralLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: globalStyles.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    backgroundColor: globalStyles.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: globalStyles.colors.white,
    fontWeight: 'bold',
  },
  editIcon: {
    position: 'absolute',
    backgroundColor: globalStyles.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: globalStyles.colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: globalStyles.colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 350,
    shadowColor: globalStyles.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: globalStyles.colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: globalStyles.colors.background,
  },
  modalOptionText: {
    fontSize: 16,
    color: globalStyles.colors.text,
    marginLeft: 12,
    flex: 1,
  },
  cancelOption: {
    backgroundColor: globalStyles.colors.neutralLight,
    marginTop: 8,
  },
  cancelText: {
    color: globalStyles.colors.error,
  },
});

export default Avatar;
