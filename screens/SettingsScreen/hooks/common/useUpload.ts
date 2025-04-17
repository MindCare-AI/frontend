//screens/SettingsScreen/hooks/common/useUpload.ts
import { useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';
import { Platform } from 'react-native';

// Utility function to convert a data URL to a File
const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) throw new Error('Invalid data URL');
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const useUpload = () => {
  const { accessToken } = useAuth();

  const uploadImage = useCallback(async (
    imageUri: string,
    userType: 'patient' | 'therapist',
    profileId: number
  ): Promise<string> => {
    if (!accessToken || !profileId) {
      throw new Error('Missing authentication or profile ID');
    }

    const formData = new FormData();
    let file: File | Blob;
    // Convert base64 data URL to File if needed
    if (imageUri.startsWith('data:')) {
      file = dataURLtoFile(imageUri, 'upload.jpg');
    } else {
      // For file:// URIs or similar, normalize the URI
      const normalizedUri = (Platform.OS === 'ios' || Platform.OS === 'web')
        ? imageUri.replace('file://', '')
        : imageUri;
      const filename = normalizedUri.split('/').pop() || 'upload.jpg';
      file = {
        uri: normalizedUri,
        type: 'image/jpeg',
        name: filename,
      } as any;
    }
    formData.append('profile_pic', file);

    const url = `${API_URL}/${userType}/profiles/${profileId}/`;
    const response = await axios.patch<{ profile_pic: string }>(url, formData, {
      headers: {
        // Do not set Content-Type so Axios can set the proper multipart boundary.
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.data.profile_pic) {
      throw new Error('No profile picture URL in response');
    }

    return response.data.profile_pic;
  }, [accessToken]);

  return { uploadImage };
};