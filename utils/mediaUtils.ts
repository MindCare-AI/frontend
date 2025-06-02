// mediaUtils.ts
// Utility functions for handling media files across platforms
import { Platform } from 'react-native';

interface MediaFileBase {
  uri: string;
  name?: string;
  type?: string;
}

export interface ProcessedMediaFile {
  uri: string;
  name: string;
  type: string;
  file?: File | Blob; // For web platform
}

/**
 * Extracts mime type from data URL or uses default based on file type
 */
export const extractMimeType = (uri: string, defaultType = 'image/jpeg'): string => {
  if (!uri || typeof uri !== 'string') {
    return defaultType;
  }
  
  if (uri.startsWith('data:')) {
    const mimeMatch = uri.match(/data:([^;]+);/);
    if (mimeMatch && mimeMatch[1]) {
      return mimeMatch[1];
    }
  }
  
  return defaultType;
};

/**
 * Generates a proper filename based on mime type
 */
export const generateFileName = (mimeType: string, prefix = 'media'): string => {
  const timestamp = Date.now();
  const fileExt = mimeType.split('/')[1] || 'jpg';
  return `${prefix}_${timestamp}.${fileExt}`;
};

/**
 * Processes a media file to ensure it has correct name and type properties
 * On web, will convert data URLs to File objects if needed
 */
export const processMediaFile = async (
  mediaFile: MediaFileBase | File | Blob,
  fileType: 'image' | 'video' = 'image'
): Promise<ProcessedMediaFile> => {
  console.log('Processing media file for type:', fileType);
  
  // Default values for safety
  const defaultMimeType = fileType === 'image' ? 'image/jpeg' : 'video/mp4';
  
  // Handle Web File objects
  if (typeof File !== 'undefined' && mediaFile instanceof File) {
    return {
      uri: URL.createObjectURL(mediaFile),
      name: mediaFile.name || generateFileName(mediaFile.type || defaultMimeType),
      type: mediaFile.type || defaultMimeType,
      file: mediaFile
    };
  }
  
  // Handle Web Blob objects
  if (typeof Blob !== 'undefined' && mediaFile instanceof Blob) {
    const fileName = generateFileName(mediaFile.type || defaultMimeType);
    return {
      uri: URL.createObjectURL(mediaFile),
      name: fileName,
      type: mediaFile.type || defaultMimeType,
      file: new File([mediaFile], fileName, { type: mediaFile.type || defaultMimeType })
    };
  }
  
  // Handle standard object with uri property
  if (mediaFile && typeof mediaFile === 'object' && 'uri' in mediaFile && mediaFile.uri) {
    const uri = mediaFile.uri;
    
    // Extract the correct mime type
    const mimeType = extractMimeType(uri, defaultMimeType);
    const fileName = mediaFile.name || generateFileName(mimeType);
    
    // For web platform, convert data URLs to proper File objects
    if (Platform.OS === 'web' && uri.startsWith('data:')) {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], fileName, { 
          type: mimeType,
          lastModified: new Date().getTime()
        });
        
        return {
          uri,
          name: fileName,
          type: mimeType,
          file
        };
      } catch (error) {
        console.error('Failed to convert data URL to File:', error);
        
        // Return the original with fixed properties
        return {
          uri,
          name: fileName,
          type: mimeType
        };
      }
    }
    
    // For native platforms or web without data URLs
    return {
      uri,
      name: fileName,
      type: mimeType
    };
  }
  
  // Fallback for unexpected input
  console.warn('Invalid media file input:', mediaFile);
  return {
    uri: '',
    name: generateFileName(defaultMimeType),
    type: defaultMimeType
  };
};

/**
 * Prepares a media file for FormData upload
 */
export const prepareMediaForUpload = async (
  mediaFile: MediaFileBase | File | Blob,
  fileType: 'image' | 'video' = 'image'
): Promise<any> => {
  const processed = await processMediaFile(mediaFile, fileType);
  
  if (Platform.OS === 'web') {
    // For web, return File object if available
    return processed.file || {
      uri: processed.uri,
      name: processed.name,
      type: processed.type
    };
  } else {
    // For React Native
    return {
      uri: processed.uri,
      name: processed.name,
      type: processed.type
    };
  }
};
