//screens/SettingsScreen/components/ProfileAvatar.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';

interface Profile {
  profile_pic?: string;
  unique_id?: string;
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
  const isTherapist = user?.user_type === 'therapist';
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

      await uploadImageToServer(result.assets[0].uri);
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadImageToServer = async (uri: string) => {
    if (!profile.unique_id) {
      Alert.alert('Error', 'Profile ID not available. Please try again later.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData and append the file using the correct key ('profile_pic')
      const formData = new FormData();
      formData.append('profile_pic', {
        uri: uri,
        name: 'profile.jpg',
        type: 'image/jpeg'
      } as any);

      // Determine the correct endpoint based on user type
      const profileEndpoint = isTherapist 
        ? `${API_URL}/therapist/profiles/${profile.unique_id}/`
        : `${API_URL}/patient/profiles/${profile.unique_id}/`;

      // Send the PATCH request with the multipart/form-data content
      const profileResponse = await fetch(profileEndpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          // Note: Do not set the Content-Type header manually when using FormData on some platforms.
        },
        body: formData,
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Profile update failed:', errorText);
        throw new Error(`Profile update failed: ${errorText}`);
      }

      const updatedProfile = await profileResponse.json();
      onImageChange(updatedProfile.profile_pic);

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload profile picture. Please try again.',
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