//screens/SettingsScreen/hooks/common/useUpload.ts
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';

export const useUpload = () => {
  const { accessToken, user } = useAuth();

  /**
   * Uploads a file (image or document) to the backend and associates it with a patient or therapist profile.
   * @param uri - The local URI of the file to upload.
   * @param profileType - 'patient' or 'therapist'.
   * @param type - Optional: 'verification' for verification docs, otherwise profile image.
   * @param description - Optional: description for the media file.
   * @param mediaType - Optional: media type, e.g., 'image', 'document'.
   * @returns The uploaded file's URL.
   */
  const uploadImage = async (
    uri: string,
    profileType: 'patient' | 'therapist',
    type?: string,
    description?: string,
    mediaType?: string
  ) => {
    const formData = new FormData();
    // Use a different filename if uploading a verification document
    const fileName = type === 'verification' ? 'verification.jpg' : 'profile.jpg';
    // Default to image/jpeg, but allow override if needed
    const mimeType = mediaType === 'document' ? 'application/pdf' : 'image/jpeg';
    formData.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    // Append extra fields for associating the media with a profile
    formData.append(
      'content_type',
      profileType === 'patient' ? 'patient_profile' : 'therapist_profile'
    );

    // Use numeric id instead of unique_id
    const profileId =
      profileType === 'therapist'
        ? user?.therapist_profile?.id
        : user?.patient_profile?.id;

    if (profileId !== undefined && profileId !== null) {
      formData.append('object_id', profileId.toString());
    } else {
      throw new Error('Profile ID not found');
    }

    if (description) {
      formData.append('description', description);
    }
    if (mediaType) {
      formData.append('media_type', mediaType);
    }

    try {
      // Backend media upload endpoint: POST /media/upload/
      const response = await fetch(`${API_URL}/media/upload/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Do not set the Content-Type header manually when sending FormData.
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData?.detail || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  return { uploadImage };
};