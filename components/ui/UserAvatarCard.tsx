import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { globalStyles } from '../../styles/global';
import * as ImagePicker from 'expo-image-picker';

interface UserAvatarCardProps {
  avatar?: string;
  name: string;
  role?: string;
  onAvatarChange?: (newAvatarUri: string) => void;
}

const UserAvatarCard: React.FC<UserAvatarCardProps> = ({
  avatar,
  name,
  role,
  onAvatarChange
}) => {
  const handleAvatarPress = async () => {
    if (!onAvatarChange) return;

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
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
  };

  const defaultAvatar = require('../../assets/default-avatar.png');

  return (
    <View style={styles.profileSection}>
      <View style={styles.profilePictureSection}>
        <View style={styles.profilePicture}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No image</Text>
            </View>
          )}
        </View>
        
        <View style={styles.uploadControls}>
          <Text style={styles.label}>Profile Picture</Text>
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={onAvatarChange ? handleAvatarPress : undefined}
            disabled={!onAvatarChange}
          >
            <Text style={styles.uploadButtonText}>
              {onAvatarChange ? 'Choose Image' : 'No Access'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.nameText}>{name}</Text>
      {role && (
        <Text style={styles.roleText}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    backgroundColor: globalStyles.colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
    ...globalStyles.shadow,
  },
  profilePictureSection: {
    position: 'relative',
    marginBottom: 12,
    alignItems: 'center',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: globalStyles.colors.primary,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: globalStyles.colors.neutralLight, // Replace lightGray with neutralLight
  },
  placeholderText: {
    color: globalStyles.colors.neutralMedium, // Replace gray with neutralMedium
  },
  uploadControls: {
    marginTop: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: globalStyles.colors.text,
    marginBottom: 4,
  },
  uploadButton: {
    backgroundColor: globalStyles.colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
  },
  uploadButtonText: {
    color: globalStyles.colors.white,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: globalStyles.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  roleText: {
    fontSize: 14,
    color: globalStyles.colors.secondary,
    textAlign: 'center',
  },
});

export default UserAvatarCard;