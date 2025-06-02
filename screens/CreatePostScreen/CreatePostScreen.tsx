"use client"

import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/feeds/ThemeContext';
import { useToast } from '../../contexts/feeds/ToastContext';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as FeedsApi from '../../API/feeds';
import { useAuth } from '../../contexts/AuthContext';
import { prepareMediaForUpload } from '../../utils/mediaUtils';

const { width } = Dimensions.get('window');

const POST_TYPES = [
  { id: 'text', label: 'Text', icon: 'text-outline', color: '#4A90E2' },
  { id: 'image', label: 'Image', icon: 'image-outline', color: '#27AE60' },
  { id: 'video', label: 'Video', icon: 'videocam-outline', color: '#E74C3C' },
  { id: 'link', label: 'Link', icon: 'link-outline', color: '#9B59B6' },
];

const TOPICS = [
  { id: 'mental_health', label: '🧠 Mental Health', color: '#3498DB' },
  { id: 'therapy', label: '🛋️ Therapy', color: '#8E44AD' },
  { id: 'self_care', label: '🧘 Self Care', color: '#9C27B0' },
  { id: 'mindfulness', label: '🧠 Mindfulness', color: '#2196F3' },
  { id: 'stress_management', label: '😓 Stress Management', color: '#FF5722' },
  { id: 'relationships', label: '💝 Relationships', color: '#E91E63' },
  { id: 'personal_growth', label: '🌱 Personal Growth', color: '#27AE60' },
  { id: 'anxiety', label: '😰 Anxiety', color: '#F39C12' },
  { id: 'depression', label: '😔 Depression', color: '#3498DB' },
  { id: 'wellness', label: '💪 Wellness', color: '#00BCD4' },
];

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const toast = useToast();
  const { user } = useAuth();
  
  // Valid tags based on backend's TAG_CHOICES
  const validTagOptions = [
    'mental_health', 'therapy', 'self_care', 'mindfulness',
    'stress_management', 'relationships', 'personal_growth',
    'anxiety', 'depression', 'wellness'
  ];
  
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Video player for expo-video
  const videoPlayer = useVideoPlayer(
    selectedMedia && postType === 'video' ? selectedMedia.uri : "", 
    (player) => {
      player.loop = false
      player.muted = false
    }
  )

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleMediaPicker = async () => {
    setMediaLoading(true);
    try {
      if (postType === 'image') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          setSelectedMedia(result.assets[0]);
        }
      } else if (postType === 'video') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          videoMaxDuration: 60, // 60 seconds max
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          setSelectedMedia(result.assets[0]);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    } finally {
      setMediaLoading(false);
    }
  };

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
      
      const formData = new FormData();
      formData.append('content', content);
      formData.append('post_type', postType);
      
      if (topic) {
        formData.append('topics', topic);
      }
      
      // Backend requires a single string value for tags, not an array
      // Make sure we're sending a single string value that matches the backend's choices
      if (tags) {
        console.log('DEBUG: Selected tag:', tags);
        formData.append('tags', tags);
      } else {
        // Default tag if none provided
        console.log('DEBUG: Using default mental_health tag');
        formData.append('tags', 'mental_health');
      }
      
      // Add user type from auth context
      formData.append('author_user_type', user?.user_type || 'patient');
      
      if (postType === 'link' && linkUrl) {
        formData.append('link_url', linkUrl);
      }

      // Add media if selected
      if (selectedMedia && (postType === 'image' || postType === 'video')) {
        // Parse the mime type from the data URL correctly for both platforms
        let mimeType = postType === 'image' ? 'image/jpeg' : 'video/mp4';
        let fileName = `media_${Date.now()}.${postType === 'image' ? 'jpg' : 'mp4'}`;
        
        // Try to extract the actual mime type from URI if it's a data URL
        if (selectedMedia.uri.startsWith('data:')) {
          const mimeMatch = selectedMedia.uri.match(/data:([^;]+);/);
          if (mimeMatch && mimeMatch[1]) {
            mimeType = mimeMatch[1];
            const fileExt = mimeType.split('/')[1] || (postType === 'image' ? 'jpg' : 'mp4');
            fileName = `media_${Date.now()}.${fileExt}`;
          }
        }
        
        console.log('DEBUG: Media MIME type detected:', mimeType);
        
        // Enhanced platform-specific file handling
        if (Platform.OS === 'web') {
          if (selectedMedia.uri.startsWith('data:')) {
            // Convert data URL to blob for web
            try {
              const response = await fetch(selectedMedia.uri);
              const blob = await response.blob();
              
              // Create a File object from the blob with correct name and mime type
              const file = new File([blob], fileName, { 
                type: mimeType,
                lastModified: new Date().getTime()
              });
              
              // Append as File object (more compatible with FormData)
              formData.append('file', file);
              console.log('DEBUG: Added File object for web platform with name:', fileName, 'and type:', mimeType);
            } catch (blobError) {
              console.error('DEBUG: Error with blob conversion:', blobError);
              // Fallback method - try direct blob append
              try {
                const response = await fetch(selectedMedia.uri);
                const blob = await response.blob();
                formData.append('file', blob, fileName);
                console.log('DEBUG: Added blob with filename for web platform');
              } catch (e) {
                console.error('DEBUG: Blob fallback failed, using standard approach:', e);
                // Last resort fallback
                formData.append('file', {
                  uri: selectedMedia.uri,
                  name: fileName,
                  type: mimeType,
                } as any);
              }
            }
          } else {
            // Already a file object
            formData.append('file', selectedMedia as any);
            console.log('DEBUG: Added existing file object for web');
          }
        } else {
          // Create proper file object for mobile platforms
          const fileObject = {
            uri: selectedMedia.uri,
            name: fileName,
            type: mimeType,
          };
          
          // Standard React Native file object
          formData.append('file', fileObject as any);
          console.log('DEBUG: Added standard React Native file object:', fileName, mimeType);
        }
      }
      
      formData.append('visibility', 'public');
      
      await FeedsApi.createPost(formData);
      
      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      toast.toast({
        title: "Success",
        description: "Post created successfully!",
        type: "success"
      });
      
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

  const removeMedia = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedMedia(null);
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.headerButton}
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
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Post Type Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Post Type</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeContainer}
              >
                {POST_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeButton,
                      { 
                        backgroundColor: postType === type.id ? type.color : colors.card,
                        borderColor: postType === type.id ? type.color : colors.border,
                        ...styles.cardShadow
                      }
                    ]}
                    onPress={() => {
                      setPostType(type.id);
                      setSelectedMedia(null); // Reset media when changing type
                    }}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={24} 
                      color={postType === type.id ? '#FFFFFF' : type.color} 
                    />
                    <Text 
                      style={[
                        styles.typeText, 
                        { color: postType === type.id ? '#FFFFFF' : colors.text }
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Content Input */}
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, ...styles.cardShadow }]}>
              <TextInput
                style={[styles.contentInput, { color: colors.text }]}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.muted}
                multiline
                value={content}
                onChangeText={setContent}
                maxLength={1000}
              />
              <Text style={[styles.characterCount, { color: colors.muted }]}>
                {content.length}/1000
              </Text>
            </View>

            {/* Media Selection for Image/Video */}
            {(postType === 'image' || postType === 'video') && (
              <View style={[styles.mediaSection, { backgroundColor: colors.card, borderColor: colors.border, ...styles.cardShadow }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {postType === 'image' ? 'Add Image' : 'Add Video'}
                </Text>
                
                {!selectedMedia ? (
                  <TouchableOpacity
                    style={[styles.mediaButton, { borderColor: colors.border }]}
                    onPress={handleMediaPicker}
                    disabled={mediaLoading}
                  >
                    {mediaLoading ? (
                      <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons 
                          name={postType === 'image' ? 'image-outline' : 'videocam-outline'} 
                          size={48} 
                          color={colors.muted} 
                        />
                        <Text style={[styles.mediaButtonText, { color: colors.text }]}>
                          Tap to select {postType}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.mediaPreview}>
                    {postType === 'image' ? (
                      <Image source={{ uri: selectedMedia.uri }} style={styles.previewImage} />
                    ) : (
                      <VideoView
                        player={videoPlayer}
                        style={styles.previewVideo}
                        nativeControls
                        allowsFullscreen
                      />
                    )}
                    <TouchableOpacity style={styles.removeButton} onPress={removeMedia}>
                      <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            
            {/* Link URL Input */}
            {postType === 'link' && (
              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, ...styles.cardShadow }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Link URL</Text>
                <TextInput
                  style={[styles.urlInput, { color: colors.text, borderColor: colors.border }]}
                  placeholder="https://example.com"
                  placeholderTextColor={colors.muted}
                  value={linkUrl}
                  onChangeText={setLinkUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            )}
            
            {/* Topic Selection */}
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, ...styles.cardShadow }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Topic</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topicsContainer}
              >
                {TOPICS.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.topicChip,
                      { 
                        backgroundColor: topic === t.id ? t.color : colors.highlight,
                        borderColor: topic === t.id ? t.color : colors.border,
                        ...styles.chipShadow
                      }
                    ]}
                    onPress={() => setTopic(topic === t.id ? '' : t.id)}
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
            
            {/* Tags Input */}
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, ...styles.cardShadow }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Tags (Select one)</Text>
              <View style={styles.tagsSelectContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {validTagOptions.map((tagOption) => (
                    <TouchableOpacity 
                      key={tagOption}
                      style={[
                        styles.tagChip, 
                        { 
                          backgroundColor: tags === tagOption ? colors.primary : colors.card,
                          borderColor: tags === tagOption ? colors.primary : colors.border
                        }
                      ]}
                      onPress={() => setTags(tagOption)}
                    >
                      <Text 
                        style={[
                          styles.tagChipText, 
                          { color: tags === tagOption ? 'white' : colors.text }
                        ]}
                      >
                        {tagOption.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <Text style={[styles.tagHint, { color: colors.muted }]}>
                {tags ? `Selected tag: ${tags.replace('_', ' ')}` : 'Please select exactly one tag'}
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeContainer: {
    paddingVertical: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: 100,
  },
  typeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  contentInput: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  topicsContainer: {
    paddingVertical: 4,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagsInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  tagsSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mediaSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  mediaButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  mediaButtonText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  mediaPreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  previewVideo: {
    width: '100%',
    height: 200,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chipShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tagHint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CreatePostScreen;
