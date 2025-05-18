import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.avatarContainer}
        onPress={onAvatarChange ? handleAvatarPress : undefined}
        disabled={!onAvatarChange}
      >
        <Image
          source={avatar ? { uri: avatar } : defaultAvatar}
          style={styles.avatar}
        />
        {onAvatarChange && (
          <View style={styles.editIconContainer}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        {role && (
          <Text style={styles.role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: globalStyles.colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
    ...globalStyles.shadow,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: globalStyles.colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: globalStyles.colors.white,
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: globalStyles.colors.text,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: globalStyles.colors.secondary,
  },
});

export default UserAvatarCard;