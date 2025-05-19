"use client"

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/feeds/ThemeContext';
import { useToast } from '../../contexts/feeds/ToastContext';
import * as FeedsApi from '../../API/feeds';

const POST_TYPES = [
  { id: 'text', label: 'Text', icon: 'text' },
  { id: 'image', label: 'Image', icon: 'image' },
  { id: 'video', label: 'Video', icon: 'videocam' },
  { id: 'link', label: 'Link', icon: 'link' },
];

const TOPICS = [
  { id: 'personal_growth', label: 'Personal Growth' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'depression', label: 'Depression' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'self_care', label: 'Self Care' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'stress', label: 'Stress' },
];

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const toast = useToast();
  
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.toast({
        title: "Error",
        description: "Post content cannot be empty",
        type: "error"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create form data for the post
      const formData = new FormData();
      formData.append('content', content);
      formData.append('post_type', postType);
      
      if (topic) {
        formData.append('topics', topic);
      }
      
      if (tags) {
        formData.append('tags', tags);
      }
      
      if (postType === 'link' && linkUrl) {
        formData.append('link_url', linkUrl);
      }
      
      formData.append('visibility', 'public');
      
      // Submit the post
      console.log("Creating post with data:", {
        content,
        post_type: postType,
        topics: topic,
        tags,
        link_url: linkUrl,
        visibility: 'public'
      });
      
      await FeedsApi.createPost(formData);
      
      toast.toast({
        title: "Success",
        description: "Post created successfully!",
        type: "success"
      });
      
      // Navigate back to the feed
      navigation.goBack();
      
    } catch (error) {
      console.error("Error creating post:", error);
      toast.toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Post</Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            style={[
              styles.postButton, 
              { 
                backgroundColor: colors.primary,
                opacity: !content.trim() || isSubmitting ? 0.6 : 1 
              }
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.postTypesContainer}>
            {POST_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.postTypeButton,
                  { 
                    backgroundColor: postType === type.id ? colors.primary : colors.card,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => setPostType(type.id)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={20} 
                  color={postType === type.id ? '#FFFFFF' : colors.text} 
                />
                <Text 
                  style={[
                    styles.postTypeText, 
                    { color: postType === type.id ? '#FFFFFF' : colors.text }
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.contentInput, { color: colors.text }]}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.muted}
              multiline
              value={content}
              onChangeText={setContent}
            />
          </View>
          
          {postType === 'link' && (
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Link URL</Text>
              <TextInput
                style={[styles.urlInput, { color: colors.text }]}
                placeholder="Enter URL"
                placeholderTextColor={colors.muted}
                value={linkUrl}
                onChangeText={setLinkUrl}
              />
            </View>
          )}
          
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Topic</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.topicsScrollView}
            >
              {TOPICS.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.topicChip,
                    { 
                      backgroundColor: topic === t.id ? colors.primary : colors.highlight,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => setTopic(t.id)}
                >
                  <Text 
                    style={[
                      styles.topicChipText, 
                      { color: topic === t.id ? '#FFFFFF' : colors.text }
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Tags (comma separated)</Text>
            <TextInput
              style={[styles.tagsInput, { color: colors.text }]}
              placeholder="anxiety, stress, help, etc."
              placeholderTextColor={colors.muted}
              value={tags}
              onChangeText={setTags}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  postTypesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  postTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  postTypeText: {
    marginLeft: 4,
    fontWeight: '500',
  },
  inputContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  contentInput: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  urlInput: {
    fontSize: 16,
    height: 40,
  },
  tagsInput: {
    fontSize: 16,
    height: 40,
  },
  topicsScrollView: {
    marginTop: 8,
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CreatePostScreen;
