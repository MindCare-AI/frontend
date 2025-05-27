import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

// Add the missing state declarations
const [profilePicture, setProfilePicture] = useState<any>(null);
const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fix: Use MediaTypeOptions instead of MediaType
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  if (!result.canceled) {
    setProfilePicture(result.assets[0]);
    setProfilePictureUrl(result.assets[0].uri);
  }
};
