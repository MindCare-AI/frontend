import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/global';
import * as ImagePicker from 'expo-image-picker';

interface UserAvatarCardProps {
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string | null;
  onAvatarChange?: (uri: string) => void;
  onPress?: () => void;
}

export const UserAvatarCard: React.FC<UserAvatarCardProps> = ({
  name,
  email,
  role,
  avatarUrl,
  onAvatarChange,
  onPress,
}) => {
  const handleAvatarPress = async () => {
    if (!onAvatarChange) return;

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }
      
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        onAvatarChange(pickerResult.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking an image:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleAvatarPress}
          disabled={!onAvatarChange}
        >
          <Image
            source={avatarUrl ? { uri: avatarUrl } : require('../../assets/default-avatar.png')}
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
          {email && <Text style={styles.email}>{email}</Text>}
          {role && <Text style={styles.role}>{role}</Text>}
        </View>
        
        {onPress && (
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={24} color={globalStyles.colors.textSecondary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: globalStyles.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: globalStyles.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: globalStyles.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: globalStyles.colors.white,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: globalStyles.colors.text,
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: globalStyles.colors.textSecondary,
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
    color: globalStyles.colors.primary,
    textTransform: 'capitalize',
  },
  arrowContainer: {
    marginLeft: 8,
  },
});