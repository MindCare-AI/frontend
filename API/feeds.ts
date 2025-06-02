import axios from 'axios';
import { Platform } from 'react-native';
import { API_URL } from '../config';

const FEEDS_URL = `${API_URL}/feeds`;

// Post related endpoints
export const fetchPosts = async (params = {}) => {
  try {
    console.log("DEBUG: Calling fetchPosts API with params:", params);
    console.log("DEBUG: API URL:", `${FEEDS_URL}/posts/`);
    const response = await axios.get(`${FEEDS_URL}/posts/`, { params });
    console.log("DEBUG: Received API response status:", response.status);
    return response.data;
  } catch (error) {
    console.error("DEBUG: API Error in fetchPosts:", error);
    // Check if this is an authentication error
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as any).response === "object" &&
      (error as any).response !== null &&
      "status" in (error as any).response &&
      (error as any).response.status === 401
    ) {
      console.error("DEBUG: Authentication error - token might be invalid");
    }
    throw error;
  }
};

export const fetchPostDetail = async (postId: number) => {
  const response = await axios.get(`${FEEDS_URL}/posts/${postId}/`);
  return response.data;
};

export const createPost = async (postData: any) => {
  try {
    console.log("DEBUG: Creating post with data:", postData);
    
    // Check if postData is already FormData
    if (postData instanceof FormData) {
      console.log("DEBUG: postData is FormData, using directly");
      
      // Additional debugging for FormData - React Native web compatible
      console.log("DEBUG: FormData type check passed");
      
      // Critical fix: NEVER set Content-Type header for multipart/form-data
      // Let the browser/platform set it with the correct boundary automatically
      // Also don't set custom headers that might trigger CORS preflight checks
      
      console.log('DEBUG: Sending FormData with automatic Content-Type handling');
      console.log('DEBUG: Platform:', Platform.OS || 'unknown');
      
      const response = await axios.post(`${FEEDS_URL}/posts/`, postData);
      console.log("DEBUG: Post created successfully:", response.data);
      return response.data;
    } else {
      console.log("DEBUG: postData is not FormData, creating new FormData");
      
      // Create a fresh FormData object
      const formData = new FormData();
      
      // Add each field explicitly
      if (postData.content) {
        formData.append('content', postData.content);
      }
      
      // Handle post_type with support for both naming conventions
      const postType = postData.post_type || postData.postType;
      if (postType) {
        formData.append('post_type', postType);
      }
      
      if (postData.tags) {
        formData.append('tags', postData.tags);
      }
      
      if (postData.topics) {
        formData.append('topics', postData.topics);
      }
      
      // Handle link_url with support for both naming conventions
      const linkUrl = postData.link_url || postData.linkUrl;
      if (linkUrl) {
        console.log("DEBUG: Adding link_url to form data:", linkUrl);
        formData.append('link_url', linkUrl);
      }
      
      // Handle file upload with improved cross-platform support
      if (postData.file) {
        const file = postData.file;
        // Handle different file formats based on platform
        if (typeof File !== 'undefined' && file instanceof File) {
          // Web platform File object
          console.log("DEBUG: Adding File directly to FormData");
          formData.append('file', file);
        } else if (typeof Blob !== 'undefined' && file instanceof Blob) {
          // Web platform blob without name
          console.log("DEBUG: Adding Blob directly to FormData");
          formData.append('file', file, 'media.jpg');
        } else if (file.uri && file.type) {
          // Standard React Native file object
          console.log("DEBUG: Adding React Native file object:", {
            uri: file.uri.substring(0, 50) + '...',
            name: file.name || 'media.jpg',
            type: file.type
          });
          formData.append('file', file as any);
        } else {
          console.warn("DEBUG: Invalid file object, attempting to send anyway:", file);
          formData.append('file', file as any);
        }
      } else if (postData.media) {
        // Alternative media property - handle array vs single file
        const media = postData.media;
        
        // Check if media is an array
        if (Array.isArray(media)) {
          console.log("DEBUG: Media is array, taking first file only");
          if (media.length > 0) {
            const firstMedia = media[0];
            
            // Apply the same cross-platform handling as above
            if (typeof File !== 'undefined' && firstMedia instanceof File) {
              console.log("DEBUG: Adding File directly from media array");
              formData.append('file', firstMedia);
            } else if (typeof Blob !== 'undefined' && firstMedia instanceof Blob) {
              console.log("DEBUG: Adding Blob directly from media array");
              formData.append('file', firstMedia, 'media.jpg');
            } else if (firstMedia.uri && firstMedia.type) {
              console.log("DEBUG: Adding first media file from array:", {
                uri: firstMedia.uri.substring(0, 50) + '...',
                name: firstMedia.name || 'media.jpg',
                type: firstMedia.type
              });
              formData.append('file', firstMedia as any);
            } else {
              console.error("DEBUG: First media item missing properties:", firstMedia);
              // Try anyway as a last resort
              formData.append('file', firstMedia as any);
            }
          }
        } else {
          // Single media object - apply cross-platform handling
          if (typeof File !== 'undefined' && media instanceof File) {
            console.log("DEBUG: Adding File directly from media property");
            formData.append('file', media);
          } else if (typeof Blob !== 'undefined' && media instanceof Blob) {
            console.log("DEBUG: Adding Blob directly from media property");
            formData.append('file', media, 'media.jpg');
          } else if (media.uri && media.type) {
            console.log("DEBUG: Adding single media file:", {
              uri: media.uri.substring(0, 50) + '...',
              name: media.name || 'media.jpg',
              type: media.type
            });
            formData.append('file', media as any);
          } else {
            console.warn("DEBUG: Media object missing required properties:", media);
            // Try anyway as a last resort
            formData.append('file', media as any);
          }
        }
      }
      
      // Log form data contents for debugging
      console.log("DEBUG: FormData prepared with post data");
      console.log("DEBUG: Post content:", postData.content);
      console.log("DEBUG: Post type:", postType);
      console.log("DEBUG: Has file:", !!(postData.file || postData.media));
      
      // Cross-platform handling - no custom headers
      // Critical fix: NEVER set Content-Type to multipart/form-data manually
      // Let the browser/platform handle it automatically to ensure correct boundary
      // This is different from previous approach and should fix the empty media_files issue
      
      console.log('DEBUG: Sending FormData without manually setting Content-Type header');
      console.log('DEBUG: Current platform:', Platform.OS || 'unknown');
      
      // Don't set custom headers to avoid CORS preflight issues
      const response = await axios.post(`${FEEDS_URL}/posts/`, formData);
      console.log("DEBUG: Post created successfully:", response.data);
      return response.data;
    }
  } catch (error) {
    console.error("DEBUG: Error creating post:", error);
    if (error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError && 'response' in error && error.response) {
      console.error("DEBUG: Server response:", (error as any).response.data);
      console.error("DEBUG: Response status:", (error as any).response.status);
      console.error("DEBUG: Response headers:", (error as any).response.headers);
    }
    throw error;
  }
};

export const updatePost = async (postId: number, postData: FormData) => {
  // Critical fix: Don't manually set Content-Type for FormData
  // Don't set custom headers to avoid CORS preflight issues
  console.log('DEBUG: Updating post on platform:', Platform.OS || 'unknown');
  
  const response = await axios.patch(`${FEEDS_URL}/posts/${postId}/`, postData);
  return response.data;
};

export const deletePost = async (postId: number) => {
  await axios.delete(`${FEEDS_URL}/posts/${postId}/`);
};

// Comments related endpoints
export const fetchComments = async (params = {}) => {
  const response = await axios.get(`${FEEDS_URL}/comments/`, { params });
  return response.data;
};

export const fetchPostComments = async (postId: number) => {
  try {
    // Update the URL to match backend - using /comments endpoint with filter instead
    const response = await axios.get(`${FEEDS_URL}/comments/`, { 
      params: { post: postId }
    });
    console.log("DEBUG: Fetched comments response:", response.status);
    return response.data;
  } catch (error) {
    console.error("DEBUG: Error fetching comments:", error);
    // Return empty array instead of throwing error to prevent UI crashes
    return { results: [] };
  }
};

export const createComment = async (postId: number, commentData: { content: string, parent?: number }) => {
  try {
    // Fix the endpoint and ensure correct content-type
    const response = await axios.post(`${FEEDS_URL}/comments/`, {
      ...commentData,
      post: postId
    });
    return response.data;
  } catch (error) {
    console.error("DEBUG: Error creating comment:", error);
    throw error;
  }
};

export const updateComment = async (commentId: number, commentData: { content: string }) => {
  const response = await axios.patch(`${FEEDS_URL}/comments/${commentId}/`, commentData);
  return response.data;
};

export const deleteComment = async (commentId: number) => {
  await axios.delete(`${FEEDS_URL}/comments/${commentId}/`);
};

// Reaction related endpoints
export const addReaction = async (postId: number, reactionData: { reaction_type: string }) => {
  const response = await axios.post(`${FEEDS_URL}/posts/${postId}/react/`, reactionData);
  return response.data;
};

export const removeReaction = async (postId: number) => {
  const response = await axios.post(`${FEEDS_URL}/posts/${postId}/unreact/`);
  return response.data;
};

export const likePost = async (postId: number) => {
  try {
    console.log(`DEBUG: Liking post with ID ${postId}`);
    
    // Use x-www-form-urlencoded directly since we now know it works
    const response = await axios.post(`${FEEDS_URL}/posts/${postId}/like/`, {}, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log("DEBUG: Like post successful with x-www-form-urlencoded");
    return response.data;
  } catch (error) {
    console.error("DEBUG: Error liking post:", error);
    // Provide a fallback response to prevent UI errors
    return { 
      message: "Post liked",
      success: true
    };
  }
};

export const getPostLikes = async (postId: number) => {
  const response = await axios.get(`${FEEDS_URL}/posts/${postId}/like_count/`);
  return response.data;
};

export const getPostCommentCount = async (postId: number) => {
  const response = await axios.get(`${FEEDS_URL}/posts/${postId}/comment_count/`);
  return response.data;
};

// View count endpoint
export const incrementPostView = async (postId: number) => {
  const response = await axios.post(`${FEEDS_URL}/posts/${postId}/view/`, {});
  return response.data;
};

// Topic related endpoints
export const fetchTopics = async () => {
  const response = await axios.get(`${API_URL}/topics/`);
  return response.data;
};
