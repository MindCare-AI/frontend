/**
 * Utility functions for handling media files across platforms
 * Provides consistent methods for processing image and video files
 * for React Native cross-platform compatibility
 */

import { Platform } from 'react-native';

export interface ProcessedMediaFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

/**
 * Process a media file object to ensure consistent format across platforms
 * 
 * @param mediaFile Original media file object (from picker or selection)
 * @param fileType Type of file ('image' or 'video')
 * @returns Processed media file object ready for FormData
 */
export const processMediaFile = async (
  mediaFile: any, 
  fileType: 'image' | 'video' = 'image'
): Promise<ProcessedMediaFile> => {
  if (!mediaFile) {
    throw new Error('No media file provided');
  }

  if (Platform.OS === 'web') {
    return await processWebMediaFile(mediaFile, fileType);
  } else {
    return processNativeMediaFile(mediaFile, fileType);
  }
};

/**
 * Process a media file for web platform
 */
const processWebMediaFile = async (
  mediaFile: any, 
  fileType: 'image' | 'video'
): Promise<ProcessedMediaFile> => {
  // Case 1: Already a File object
  if (typeof File !== 'undefined' && mediaFile instanceof File) {
    return {
      uri: URL.createObjectURL(mediaFile),
      name: mediaFile.name,
      type: mediaFile.type,
      size: mediaFile.size,
    };
  }
  
  // Case 2: Already a Blob object
  if (typeof Blob !== 'undefined' && mediaFile instanceof Blob) {
    const extension = fileType === 'image' ? 'jpg' : 'mp4';
    const mimeType = fileType === 'image' ? 'image/jpeg' : 'video/mp4';
    
    return {
      uri: URL.createObjectURL(mediaFile),
      name: `media_${Date.now()}.${extension}`,
      type: mediaFile.type || mimeType,
      size: mediaFile.size,
    };
  }
  
  // Case 3: Data URL
  if (mediaFile.uri && typeof mediaFile.uri === 'string' && mediaFile.uri.startsWith('data:')) {
    // Extract MIME type from data URL
    const mimeMatch = mediaFile.uri.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : (fileType === 'image' ? 'image/jpeg' : 'video/mp4');
    const extension = mimeType.split('/')[1] || (fileType === 'image' ? 'jpg' : 'mp4');
    const fileName = `media_${Date.now()}.${extension}`;
    
    try {
      // Convert data URL to File object
      const response = await fetch(mediaFile.uri);
      const blob = await response.blob();
      const file = new File([blob], fileName, { 
        type: mimeType,
        lastModified: new Date().getTime()
      });
      
      return {
        uri: URL.createObjectURL(file),
        name: fileName,
        type: mimeType,
        size: file.size,
      };
    } catch (error) {
      console.error('Error converting data URL to File:', error);
      
      // Fallback to simple object
      return {
        uri: mediaFile.uri,
        name: fileName,
        type: mimeType
      };
    }
  }
  
  // Case 4: Object with uri property
  if (mediaFile.uri) {
    // Try to determine type from uri if possible
    let type = fileType === 'image' ? 'image/jpeg' : 'video/mp4';
    let extension = fileType === 'image' ? 'jpg' : 'mp4';
    
    if (mediaFile.type) {
      type = mediaFile.type;
      extension = type.split('/')[1] || extension;
    }
    
    return {
      uri: mediaFile.uri,
      name: mediaFile.name || `media_${Date.now()}.${extension}`,
      type: type,
      size: mediaFile.size
    };
  }
  
  // Fallback for unrecognized formats
  throw new Error('Unsupported media file format');
};

/**
 * Process a media file for native platforms (iOS/Android)
 */
const processNativeMediaFile = (
  mediaFile: any, 
  fileType: 'image' | 'video'
): ProcessedMediaFile => {
  // For React Native expo-image-picker result
  if (mediaFile.uri) {
    const extension = mediaFile.uri.split('.').pop() || (fileType === 'image' ? 'jpg' : 'mp4');
    const mimeType = fileType === 'image' ? `image/${extension}` : `video/${extension}`;
    
    return {
      uri: mediaFile.uri,
      name: mediaFile.fileName || `media_${Date.now()}.${extension}`,
      type: mediaFile.type || mimeType,
      size: mediaFile.fileSize
    };
  }
  
  // Fallback for unrecognized formats
  throw new Error('Invalid media file format for native platform');
};

/**
 * Prepare a media file for FormData submission
 * Returns an object ready to be appended to FormData
 */
export const prepareMediaForUpload = async (mediaFile: any, fileType: 'image' | 'video' = 'image'): Promise<any> => {
  const processedFile = await processMediaFile(mediaFile, fileType);
  
  if (Platform.OS === 'web') {
    // For web, convert to proper File object if needed
    if (processedFile.uri.startsWith('data:')) {
      try {
        const response = await fetch(processedFile.uri);
        const blob = await response.blob();
        return new File([blob], processedFile.name, { 
          type: processedFile.type,
          lastModified: new Date().getTime()
        });
      } catch (error) {
        console.error('Error creating File object:', error);
        // Fallback to blob with name
        const response = await fetch(processedFile.uri);
        const blob = await response.blob();
        return new File([blob], processedFile.name, {
          type: processedFile.type,
          lastModified: new Date().getTime()
        });
      }
    } else if (typeof File !== 'undefined' && mediaFile instanceof File) {
      // Already a File object
      return mediaFile;
    } else if (typeof Blob !== 'undefined' && mediaFile instanceof Blob) {
      // Already a Blob, but ensure it has a name
      return new File([mediaFile], processedFile.name, {
        type: processedFile.type,
        lastModified: new Date().getTime()
      });
    } else {
      // Last resort, return the processed file
      return processedFile;
    }
  } else {
    // For native platforms, return the processed file
    return processedFile;
  }
};
