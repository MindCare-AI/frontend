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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import { useToast } from "../../contexts/feeds/ToastContext"

interface CreatePostButtonProps {
  position?: "bottom-right" | "center"
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

  const TOPIC_CHOICES = ["Technology", "Business", "Health", "Science", "Entertainment", "Sports"]
  const TAG_CHOICES = ["Trending", "Popular", "New", "Programming", "Design", "Marketing"]

  const handleAddTag = () => {
    if (tagInput && !selectedTags.includes(tagInput)) {
      setSelectedTags([...selectedTags, tagInput])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const handleCreatePost = async () => {
    setIsCreatingPost(true)
    
    try {
      // Import the API function
      const { createPost } = await import('../../API/feeds');
      
      // Prepare the post data in the correct format
      const postData = {
        content: postContent,
        type: postType,
        topic: selectedTopic,
        tags: selectedTags,
      };

      console.log('Creating post with data:', postData);
      
      // Call the API
      const result = await createPost(postData);
      console.log('Post created successfully:', result);

      // Reset form and close modal
      setPostContent("")
      setSelectedTopic("")
      setSelectedTags([])
      setPostType("text")
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
                >
                  {postType === "image" && <Ionicons name="image" size={32} color={colors.muted} />}
                  {postType === "video" && <Ionicons name="videocam" size={32} color={colors.muted} />}
                  {postType === "poll" && <Ionicons name="stats-chart" size={32} color={colors.muted} />}
                  <Text style={[styles.mediaUploadText, { color: colors.muted }]}>
                    {postType === "image" && "Click to upload an image"}
                    {postType === "video" && "Click to upload a video"}
                    {postType === "poll" && "Add poll options (coming soon)"}
                  </Text>
                  {(postType === "image" || postType === "video") && (
                    <TouchableOpacity
                      style={[
                        styles.uploadButton,
                        {
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={{ color: colors.text }}>Upload</Text>
                    </TouchableOpacity>
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
})

export default CreatePostButton
