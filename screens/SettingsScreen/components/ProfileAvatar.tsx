//screens/SettingsScreen/components/ProfileAvatar.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';
import axios from 'axios';
import type { TherapistProfile } from '../../../types/profile';

interface Profile {
  profile_pic?: string;
  id: number;
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      await uploadImageToServer({
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        fileName: 'profile.jpg',
      });
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadImageToServer = async (image: { uri: string; type?: string; fileName?: string }) => {
    setIsUploading(true);
    const formData = new FormData();
    // Clean the URI for iOS
    const cleanedUri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
    // Append file with key 'profile_pic'
    formData.append('profile_pic', {
      uri: cleanedUri,
      type: image.type || 'image/jpeg',
      name: image.fileName || 'profile.jpg',
    } as any);

    try {
      const response = await axios.patch<TherapistProfile>(
        `${API_URL}/therapist/profiles/${profile.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            // Do not set Content-Type header manually.
          },
        }
      );
      const updatedProfile = response.data;
      onImageChange(updatedProfile.profile_pic || '');
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error("Error updating profile picture:", error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload profile picture. Please try again.',
        [{ text: 'OK' }]
      );
      throw new Error(`Profile update failed: ${JSON.stringify(error.response?.data)}`);
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