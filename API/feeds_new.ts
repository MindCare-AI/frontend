import axios from 'axios';
import { Platform } from 'react-native';
import { API_URL } from '../config';

const FEEDS_URL = `${API_URL}/feeds`;

// Post related endpoints
export const fetchPosts = async (params = {}) => {
  try {
    console.log("DEBUG: Using mock posts data with params:", params);
    
    // Import mock data
    const { MOCK_POSTS, AZIZ_BAHLOUL } = require('../data/tunisianMockData');
    
    // Filter posts if needed based on params
    let filteredPosts = [...MOCK_POSTS];
    
    // Sort by created_at (newest first)
    filteredPosts = filteredPosts.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`DEBUG: Returning ${filteredPosts.length} mock posts`);
    
    return {
      results: filteredPosts,
      count: filteredPosts.length,
      next: null,
      previous: null
    };
  } catch (error) {
    console.error("DEBUG: Error in fetchPosts mock data:", error);
    throw error;
  }
};

export const fetchPostDetail = async (postId: number) => {
  try {
    console.log("DEBUG: Using mock post detail for postId:", postId);
    
    // Import mock data
    const { MOCK_POSTS } = require('../data/tunisianMockData');
    
    // Find the post by ID
    const post = MOCK_POSTS.find((p: any) => p.id === postId || p.id === String(postId));
    
    if (!post) {
      throw new Error(`Post with ID ${postId} not found`);
    }
    
    console.log("DEBUG: Returning mock post detail");
    return post;
  } catch (error) {
    console.error("DEBUG: Error in fetchPostDetail mock data:", error);
    throw error;
  }
};

export const createPost = async (postData: any) => {
  try {
    console.log("DEBUG: Creating mock post with data:", postData);
    
    // Import mock data
    const { AZIZ_BAHLOUL } = require('../data/tunisianMockData');
    
    // Extract content from FormData if needed
    let content = '';
    let postType = 'text';
    let tags = [];
    let mediaFile = null;
    
    if (postData instanceof FormData) {
      // Extract data from FormData for mock creation
      content = 'New post created from the app';
      postType = 'text';
    } else {
      content = postData.content || 'New post content';
      postType = postData.post_type || postData.postType || 'text';
      tags = postData.tags || [];
    }
    
    // Create mock post response
    const newPost = {
      id: `post_${Date.now()}`,
      title: 'New Post',
      content,
      author: AZIZ_BAHLOUL,
      author_name: AZIZ_BAHLOUL.full_name,
      author_user_type: AZIZ_BAHLOUL.user_type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      media_files: [],
      reactions: [],
      comments: [],
      tags: tags,
      topics: ['Mental Health'],
      reactions_count: 0,
      comments_count: 0,
      likes_count: 0
    };
    
    console.log("DEBUG: Mock post created successfully:", newPost);
    return newPost;
  } catch (error) {
    console.error("DEBUG: Error creating mock post:", error);
    throw error;
  }
};

// Reaction endpoints
export const reactToPost = async (postId: number, reactionType: string) => {
  try {
    console.log("DEBUG: Mock reaction to post", postId, "with type", reactionType);
    
    // Import mock data
    const { AZIZ_BAHLOUL } = require('../data/tunisianMockData');
    
    return {
      id: Date.now(),
      user: AZIZ_BAHLOUL,
      type: reactionType,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("DEBUG: Error in mock reaction:", error);
    throw error;
  }
};

export const removeReaction = async (postId: number) => {
  try {
    console.log("DEBUG: Mock remove reaction from post", postId);
    return { success: true };
  } catch (error) {
    console.error("DEBUG: Error removing mock reaction:", error);
    throw error;
  }
};

// Comment endpoints
export const addComment = async (postId: number, content: string) => {
  try {
    console.log("DEBUG: Mock add comment to post", postId, "with content:", content);
    
    // Import mock data
    const { AZIZ_BAHLOUL } = require('../data/tunisianMockData');
    
    return {
      id: `comment_${Date.now()}`,
      content,
      author: AZIZ_BAHLOUL,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("DEBUG: Error adding mock comment:", error);
    throw error;
  }
};

export const getPostComments = async (postId: number) => {
  try {
    console.log("DEBUG: Getting mock comments for post", postId);
    
    // Import mock data
    const { MOCK_POSTS } = require('../data/tunisianMockData');
    
    // Find the post and return its comments
    const post = MOCK_POSTS.find((p: any) => p.id === postId || p.id === String(postId));
    
    return {
      results: post?.comments || [],
      count: post?.comments?.length || 0,
      next: null,
      previous: null
    };
  } catch (error) {
    console.error("DEBUG: Error getting mock comments:", error);
    throw error;
  }
};

export const deleteComment = async (commentId: number) => {
  try {
    console.log("DEBUG: Mock delete comment", commentId);
    return { success: true };
  } catch (error) {
    console.error("DEBUG: Error deleting mock comment:", error);
    throw error;
  }
};

// Follow/Unfollow endpoints
export const followUser = async (userId: string | number) => {
  try {
    console.log("DEBUG: Mock follow user", userId);
    return { success: true };
  } catch (error) {
    console.error("DEBUG: Error in mock follow:", error);
    throw error;
  }
};

export const unfollowUser = async (userId: string | number) => {
  try {
    console.log("DEBUG: Mock unfollow user", userId);
    return { success: true };
  } catch (error) {
    console.error("DEBUG: Error in mock unfollow:", error);
    throw error;
  }
};

// Favorite endpoints
export const favoritePost = async (postId: number) => {
  try {
    console.log("DEBUG: Mock favorite post", postId);
    return { success: true };
  } catch (error) {
    console.error("DEBUG: Error in mock favorite:", error);
    throw error;
  }
};

export const unfavoritePost = async (postId: number) => {
  try {
    console.log("DEBUG: Mock unfavorite post", postId);
    return { success: true };
  } catch (error) {
    console.error("DEBUG: Error in mock unfavorite:", error);
    throw error;
  }
};

// Delete post endpoint
export const deletePost = async (postId: number) => {
  try {
    console.log("DEBUG: Mock delete post", postId);
    return { success: true };
  } catch (error) {
    console.error("DEBUG: Error in mock delete post:", error);
    throw error;
  }
};
