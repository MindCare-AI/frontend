//screens/SettingsScreen/hooks/common/useUpload.ts
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';

export const useUpload = () => {
  const { accessToken, user } = useAuth();

  const uploadImage = async (
    uri: string,
    profileType: 'patient' | 'therapist',
    type?: string
  ) => {
    const formData = new FormData();
    // Use a different filename if uploading a verification document
    const fileName = type === 'verification' ? 'verification.jpg' : 'profile.jpg';
    formData.append('file', {
      uri,
      name: fileName,
      type: 'image/jpeg',
    } as any);

    // Append extra fields for associating the media with a profile
    formData.append(
      'content_type',
      profileType === 'patient' ? 'patient_profile' : 'therapist_profile'
    );

    // Assume that the user's profile unique ID is stored in patient_profile or therapist_profile
    const profileUniqueId =
      profileType === 'therapist'
        ? user?.therapist_profile?.unique_id
        : user?.patient_profile?.unique_id;

    if (profileUniqueId) {
      formData.append('object_id', profileUniqueId);
    } else {
      throw new Error('Profile unique ID not found');
    }

    try {
      // Backend media upload endpoint: POST /api/v1/media/upload/
      const response = await fetch(`${API_URL}/media/upload/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Do not set the Content-Type header manually when sending FormData.
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  return { uploadImage };
};