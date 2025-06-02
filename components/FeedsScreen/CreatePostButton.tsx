"use client"

import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import { useToast } from "../../contexts/feeds/ToastContext"
import * as ImagePicker from 'expo-image-picker';

interface CreatePostButtonProps {
  position?: "bottom-right" | "center"
}

// Define a proper type for the media file
interface MediaFile {
  uri: string;
  name?: string;
  type: string;
}

interface CreatePostResponse {
  media_files?: { url: string }[];
  message?: string;
  success: boolean;
}

const CreatePostButton: React.FC<CreatePostButtonProps> = ({ position = "bottom-right" }) => {
  // Use HomeSettingsScreen color scheme
  const homeScreenColors = {
    primary: '#002D62',
    lightBlue: '#E4F0F6',
    white: '#FFFFFF',
    textDark: '#333',
    textMedium: '#444',
    borderColor: '#F0F0F0',
    background: '#FFFFFF',
  };

  const { colors, isDark } = useTheme()
  const { toast } = useToast()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [postContent, setPostContent] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [postType, setPostType] = useState<"text" | "image" | "video" | "poll">("text")
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  
  // Fix state type declarations
  const [mediaFile, setMediaFile] = useState<any>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const TOPIC_CHOICES = [
    "Mental Health",
    "Therapy", 
    "Self Care", 
    "Mindfulness", 
    "Stress Management", 
    "Relationships", 
    "Personal Growth", 
    "Anxiety", 
    "Depression", 
    "Wellness"
  ]
  const TAG_CHOICES = [
    "Mental Health",
    "Therapy", 
    "Self Care", 
    "Mindfulness", 
    "Stress Management", 
    "Relationships", 
    "Personal Growth", 
    "Anxiety", 
    "Depression", 
    "Wellness"
  ]

  const handleAddTag = () => {
    if (tagInput && !selectedTags.includes(tagInput)) {
      setSelectedTags([...selectedTags, tagInput])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const handleSelectMedia = async () => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        toast({
          title: "Permission denied",
          description: "We need access to your media to upload files",
          type: "error",
          duration: 4000,
        });
        return;
      }
      
      const options = {
        mediaTypes: postType === "image" 
          ? ImagePicker.MediaTypeOptions.Images 
          : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      };
      
      const result = await ImagePicker.launchImageLibraryAsync(options);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // Create file object
        const fileUri = selectedAsset.uri;
        const fileName = fileUri.split('/').pop();
        const fileType = selectedAsset.mimeType || 
                         (postType === "image" ? "image/jpeg" : "video/mp4");
        
        // Create a file object for the API - React Native format for FormData
        const file = {
          uri: fileUri,
          name: fileName || `media.${postType === "image" ? "jpg" : "mp4"}`,
          type: fileType,
        } as any;
        
        setMediaFile(file);
        setMediaPreview(fileUri);
      }
    } catch (error) {
      console.error('Error selecting media:', error);
      toast({
        title: "Error",
        description: "Failed to select media. Please try again.",
        type: "error",
        duration: 4000,
      });
    }
  };

  const handleCreatePost = async () => {
    setIsCreatingPost(true)
    
    try {
      // Import the API function
      const { createPost } = await import('../../API/feeds.js');
      
      // Create a FormData instance for multipart/form-data
      const formData = new FormData();
      
      // Add content
      formData.append("content", postContent);
      
      // Map our UI post types to backend post types
      const apiPostType = postType === "poll" ? "text" : postType;
      formData.append("post_type", apiPostType);
      
      // Add topic if selected
      if (selectedTopic) {
        formData.append("topics", selectedTopic.toLowerCase().replace(" ", "_"));
      }
      
      // Add tags (backend expects a string, not an array)
      if (selectedTags.length > 0) {
        formData.append("tags", selectedTags.join(',').toLowerCase().replace(/ /g, "_"));
      } else {
        // Default tag if none selected
        formData.append("tags", "mental_health");
      }
      
      // Add media file if present with enhanced cross-platform support
      if (mediaFile && (postType === "image" || postType === "video")) {
        console.log('DEBUG: Adding media file to FormData:', mediaFile);
        
        // Parse the mime type from the data URL correctly for both platforms
        let mimeType = postType === "image" ? "image/jpeg" : "video/mp4";
        let fileName = `media_${Date.now()}.${postType === "image" ? "jpg" : "mp4"}`;
        
        // Try to extract the actual mime type from URI if it's a data URL
        if (mediaFile.uri && mediaFile.uri.startsWith('data:')) {
          const mimeMatch = mediaFile.uri.match(/data:([^;]+);/);
          if (mimeMatch && mimeMatch[1]) {
            mimeType = mimeMatch[1];
            const fileExt = mimeType.split('/')[1] || (postType === "image" ? "jpg" : "mp4");
            fileName = `media_${Date.now()}.${fileExt}`;
          }
        }
        
        console.log('DEBUG: Media MIME type detected:', mimeType);
        
        // Enhanced platform-specific file handling
        if (Platform.OS === 'web') {
          if (mediaFile.uri && mediaFile.uri.startsWith('data:')) {
            try {
              // Convert data URL to blob for web
              const response = await fetch(mediaFile.uri);
              const blob = await response.blob();
              
              // Create a File object from the blob for better compatibility
              const file = new File([blob], fileName, { 
                type: mimeType,
                lastModified: new Date().getTime()
              });
              
              formData.append("file", file);
              console.log('DEBUG: Added File object for web platform with name:', fileName, 'and type:', mimeType);
            } catch (error) {
              console.error('DEBUG: Web file handling error:', error);
              // Fallback to blob with filename
              try {
                const response = await fetch(mediaFile.uri);
                const blob = await response.blob();
                formData.append("file", blob, fileName);
                console.log('DEBUG: Added blob with filename for web platform');
              } catch (e) {
                console.error('DEBUG: Blob fallback failed, using standard approach:', e);
                // Last resort fallback
                formData.append('file', {
                  uri: mediaFile.uri,
                  name: fileName,
                  type: mimeType
                } as any);
              }
            }
          } else {
            // Already a file or blob
            formData.append("file", mediaFile);
            console.log('DEBUG: Added existing file or blob for web');
          }
        } else {
          // Ensure proper file object format for React Native FormData
          const fileObject = {
            uri: mediaFile.uri,
            name: fileName,
            type: mimeType
          };
          
          // Standard React Native approach
          console.log('DEBUG: Using standard React Native file object with name:', fileName, 'and type:', mimeType);
          formData.append("file", fileObject as any);
        }
      }
      
      console.log('Creating post with data:', {
        content: postContent,
        post_type: apiPostType,
        topics: selectedTopic, 
        tags: selectedTags,
        hasMedia: !!mediaFile
      });
      
      // Call the API with FormData
      const result = await createPost(formData);
      console.log('Post created successfully:', result);

      // Reset form and close modal
      setPostContent("")
      setSelectedTopic("")
      setSelectedTags([])
      setPostType("text")
      setMediaFile(null)
      setMediaPreview(null)
      setIsModalVisible(false)

      toast({
        title: "Post created",
        description: "Your post has been published successfully",
        type: "success",
        duration: 4000,
      })
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        type: "error",
        duration: 4000,
      });
    } finally {
      setIsCreatingPost(false)
    }
  }

  const renderButton = () => {
    if (position === "center") {
      return (
        <TouchableOpacity
          style={[
            styles.centerButton,
            {
              backgroundColor: homeScreenColors.primary,
            },
          ]}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={homeScreenColors.white} style={styles.buttonIcon} />
          <Text style={[styles.centerButtonText, { color: homeScreenColors.white }]}>Create Post</Text>
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity
        style={[
          styles.floatingButton,
          {
            backgroundColor: homeScreenColors.primary,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              },
              android: {
                elevation: 4,
              },
              web: {
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              },
            }),
          },
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={24} color={homeScreenColors.white} />
      </TouchableOpacity>
    )
  }

  return (
    <>
      {renderButton()}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create a new post</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                style={[
                  styles.contentInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: isDark ? colors.highlight : "#F5F5F5",
                  },
                ]}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.muted}
                value={postContent}
                onChangeText={setPostContent}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Topic</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicsContainer}>
                {TOPIC_CHOICES.map((topic) => (
                  <TouchableOpacity
                    key={topic}
                    style={[
                      styles.topicButton,
                      {
                        backgroundColor:
                          selectedTopic === topic ? colors.primary : isDark ? colors.highlight : "#F5F5F5",
                        borderColor: selectedTopic === topic ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedTopic(selectedTopic === topic ? "" : topic)}
                  >
                    <Text
                      style={[
                        styles.topicButtonText,
                        {
                          color: selectedTopic === topic ? "white" : colors.text,
                        },
                      ]}
                    >
                      {topic}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Post Type</Text>
              <View style={styles.postTypeContainer}>
                {[
                  { type: "text", icon: "document-text" },
                  { type: "image", icon: "image" },
                  { type: "video", icon: "videocam" },
                  { type: "poll", icon: "stats-chart" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.type}
                    style={[
                      styles.postTypeButton,
                      {
                        backgroundColor:
                          postType === item.type ? colors.primary : isDark ? colors.highlight : "#F5F5F5",
                        borderColor: postType === item.type ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setPostType(item.type as "text" | "image" | "video" | "poll")}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={postType === item.type ? "white" : colors.text}
                      style={styles.postTypeIcon}
                    />
                    <Text
                      style={[
                        styles.postTypeText,
                        {
                          color: postType === item.type ? "white" : colors.text,
                        },
                      ]}
                    >
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={[
                    styles.tagInput,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: isDark ? colors.highlight : "#F5F5F5",
                    },
                  ]}
                  placeholder="Add a tag"
                  placeholderTextColor={colors.muted}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity
                  style={[
                    styles.addTagButton,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={handleAddTag}
                >
                  <Text style={styles.addTagButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestedTagsContainer}>
                {TAG_CHOICES.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.suggestedTag,
                      {
                        backgroundColor: isDark ? colors.highlight : "#F5F5F5",
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      if (!selectedTags.includes(tag)) {
                        setSelectedTags([...selectedTags, tag])
                      }
                    }}
                  >
                    <Text style={[styles.suggestedTagText, { color: colors.text }]}>#{tag}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedTags.length > 0 && (
                <View style={styles.selectedTagsContainer}>
                  {selectedTags.map((tag) => (
                    <View
                      key={tag}
                      style={[
                        styles.selectedTag,
                        {
                          backgroundColor: isDark ? colors.highlight : "#F5F5F5",
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.selectedTagText, { color: colors.text }]}>#{tag}</Text>
                      <TouchableOpacity style={styles.removeTagButton} onPress={() => handleRemoveTag(tag)}>
                        <Ionicons name="close-circle" size={16} color={colors.muted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {postType !== "text" && (
                <TouchableOpacity
                  style={[
                    styles.mediaUploadContainer,
                    {
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={postType !== "poll" ? handleSelectMedia : undefined}
                >
                  {mediaPreview ? (
                    <View style={styles.mediaPreviewContainer}>
                      {postType === "image" && (
                        <Image source={{ uri: mediaPreview }} style={styles.mediaPreviewImage} />
                      )}
                      {postType === "video" && (
                        <View style={styles.videoPreviewPlaceholder}>
                          <Ionicons name="play-circle" size={48} color={colors.primary} />
                        </View>
                      )}
                      <TouchableOpacity 
                        style={styles.clearMediaButton}
                        onPress={() => {
                          setMediaFile(null);
                          setMediaPreview(null);
                        }}
                      >
                        <Ionicons name="close-circle" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      {postType === "image" && <Ionicons name="image" size={32} color={colors.muted} />}
                      {postType === "video" && <Ionicons name="videocam" size={32} color={colors.muted} />}
                      {postType === "poll" && <Ionicons name="stats-chart" size={32} color={colors.muted} />}
                      <Text style={[styles.mediaUploadText, { color: colors.muted }]}>
                        {postType === "image" && "Click to upload an image"}
                        {postType === "video" && "Click to upload a video"}
                        {postType === "poll" && "Add poll options (coming soon)"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>

            <View
              style={[
                styles.modalFooter,
                {
                  borderTopColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  {
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: postContent.trim() && !isCreatingPost ? 1 : 0.5,
                  },
                ]}
                onPress={handleCreatePost}
                disabled={!postContent.trim() || isCreatingPost}
              >
                <Text style={{ color: "white" }}>{isCreatingPost ? "Posting..." : "Post"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  centerButton: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  centerButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 16,
    maxHeight: "70%",
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
  },
  topicsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  topicButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  topicButtonText: {
    fontSize: 14,
  },
  postTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  postTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  postTypeIcon: {
    marginRight: 4,
  },
  postTypeText: {
    fontSize: 12,
  },
  tagInputContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginRight: 8,
  },
  addTagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
  },
  addTagButtonText: {
    color: "white",
    fontWeight: "500",
  },
  suggestedTagsContainer: {
    marginBottom: 8,
  },
  suggestedTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  suggestedTagText: {
    fontSize: 14,
  },
  selectedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  selectedTagText: {
    fontSize: 14,
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  mediaUploadContainer: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  mediaUploadText: {
    fontSize: 14,
    marginVertical: 8,
  },
  uploadButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
  },
  footerButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
  },
  mediaPreviewContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  mediaPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoPreviewPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e1e1e1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
})

export default CreatePostButton
