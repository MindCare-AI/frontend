//screens/SettingsScreen/components/ProfileAvatar.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';
import type { TherapistProfile } from '../../../types/profile';
import { useUpload } from '../hooks/common/useUpload';

interface Profile {
  profile_pic?: string;
  id: number;
  user_type: 'patient' | 'therapist';
}

interface ProfileAvatarProps {
  profile: Profile;
  onImageChange: (url: string) => void;
  isEditable?: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  profile, 
  onImageChange, 
  isEditable = true 
}) => {
  const { user, accessToken } = useAuth();
  const { uploadImage } = useUpload();
  const [isUploading, setIsUploading] = useState(false);

  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload a profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleImagePick = async () => {
    if (!isEditable) return;

    const hasPermission = await requestMediaPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // updated per fix
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      await uploadImageToServer(result.assets[0].uri);
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadImageToServer = async (imageUri: string) => {
    if (!profile?.id) {
      console.error('No profile ID available');
      Alert.alert('Error', 'Profile not properly loaded. Please try again.');
      return;
    }

    setIsUploading(true);
    try {
      const uri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;
      
      console.log('Starting image upload...', {
        uri,
        profileId: profile.id,
        userType: profile.user_type
      });

      const url = await uploadImage(
        uri, 
        profile.user_type,
        profile.id
      );

      console.log('Upload successful, URL:', url);
      onImageChange(url);
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (err: any) {
      console.error('Upload error details:', err);
      Alert.alert(
        'Upload Failed',
        err.message || 'Please try again. If the problem persists, check your internet connection.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isUploading ? (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      ) : (
        <>
          <View style={styles.avatarContainer}>
            {profile.profile_pic ? (
              <Image 
                source={{ uri: profile.profile_pic }} 
                style={styles.avatar} 
                resizeMode="cover"
              />
            ) : (
              <IconButton
                icon="account-circle"
                size={100}
                iconColor="#0066cc"
                style={styles.placeholderIcon}
              />
            )}
          </View>
          
          {isEditable && (
            <Button 
              mode="outlined"
              onPress={handleImagePick}
              style={styles.button}
              icon="camera"
            >
              {profile.profile_pic ? 'Change Photo' : 'Upload Photo'}
            </Button>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    marginVertical: 16 
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60,
  },
  placeholderIcon: {
    margin: 0,
    padding: 0,
  },
  button: {
    marginTop: 8,
    borderColor: '#0066cc',
  },
  uploadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  uploadingText: {
    marginTop: 8,
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '500',
  },
});