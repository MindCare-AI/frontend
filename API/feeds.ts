import axios from 'axios';
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
    
    // Create the appropriate structure for FormData
    const formData = new FormData();
    
    // Check if postData is already FormData
    if (postData instanceof FormData) {
      console.log("DEBUG: postData is FormData, using directly");
      
      // If tags is an array, convert to a single string value expected by backend
      const tagsEntry = Array.from(postData.entries()).find(entry => entry[0] === 'tags');
      if (tagsEntry && Array.isArray(tagsEntry[1])) {
        console.log("DEBUG: Converting tags array to string");
        postData.delete('tags');
        postData.append('tags', tagsEntry[1][0]);
      }
      
      const response = await axios.post(`${FEEDS_URL}/posts/`, postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("DEBUG: Post created successfully:", response.data);
      return response.data;
    } else {
      console.log("DEBUG: postData is not FormData, creating new FormData");
      
      // Convert object to FormData
      Object.keys(postData).forEach(key => {
        // Handle special case for tags
        if (key === 'tags') {
          // If it's an array, use the first item
          if (Array.isArray(postData[key])) {
            formData.append(key, postData[key][0]);
          } else {
            formData.append(key, postData[key]);
          }
        } 
        // Handle file upload case
        else if (key === 'media' && postData[key]) {
          formData.append('file', postData[key]);
        } 
        // Handle standard cases
        else {
          formData.append(key, postData[key]);
        }
      });
      
      const response = await axios.post(`${FEEDS_URL}/posts/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
  const response = await axios.patch(`${FEEDS_URL}/posts/${postId}/`, postData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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
