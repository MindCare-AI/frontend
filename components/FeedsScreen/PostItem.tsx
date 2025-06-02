"use client"

import React, { useState } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Dimensions, FlatList, TextInput, ActivityIndicator, Alert } from "react-native"
import { VideoView, useVideoPlayer } from "expo-video"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import { Post } from "../../types/feeds"
import { format } from "date-fns"
import { usePostReactions } from "../../hooks/feeds/usePostReactions"
import { useComments } from "../../hooks/feeds/useComments"
import { useToast } from "../../contexts/feeds/ToastContext"
import MediaViewerModal from "./MediaViewerModal"
import * as FeedsApi from "../../API/feeds"
import LoadingSpinner from "../../components/LoadingSpinner"

interface PostItemProps {
  post: Post
  onUpdatePost?: (updates: Partial<Post>) => void
  onDeletePost?: (postId: number) => void
  colors?: any
}

const PostItem: React.FC<PostItemProps> = ({ post, onUpdatePost, onDeletePost, colors: customColors }) => {
  const { colors, isDark } = useTheme()
  const displayColors = customColors || colors
  const [expanded, setExpanded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [showMediaViewer, setShowMediaViewer] = useState(false)
  const [showDropdownMenu, setShowDropdownMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content || "")
  const [isDeleting, setIsDeleting] = useState(false)
  const toast = useToast()

  const { 
    userReaction, 
    loading: reactionLoading, 
    toggleLike 
  } = usePostReactions(post.id, post.current_user_reaction)
  
  const {
    comments,
    loading: commentsLoading,
    addComment,
    refreshComments
  } = useComments(post.id)

  const windowWidth = Dimensions.get("window").width

  // Check if post has media
  const hasMedia = post.media_files && post.media_files.length > 0
  const firstMedia = post.media_files?.[0] || null
  const isVideo = firstMedia && firstMedia.media_type.includes("video")
  
  // Video player for expo-video with auto-play and muted default
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true) // Default to playing
  const videoPlayer = useVideoPlayer(isVideo ? firstMedia.file : "", (player) => {
    player.loop = true
    player.muted = isMuted
    // Auto-play the video without requiring user interaction
    if (isVideo) {
      player.play()
      setIsPlaying(true)
    }
  })

  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (videoPlayer) {
      videoPlayer.muted = !isMuted
    }
  }

  // Update video player when muted state changes
  React.useEffect(() => {
    if (videoPlayer && isVideo) {
      videoPlayer.muted = isMuted
    }
  }, [isMuted, videoPlayer, isVideo])

  // Animate when the component mounts
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start()
  }, [])

  // Handle image load completion
  const handleImageLoad = () => {
    setImageLoaded(true)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }

  // Format post date
  const formattedDate = format(new Date(post.created_at), "MMM d, yyyy • h:mm a")

  // Total reactions count
  const reactionsCount = Object.values(post.reactions_summary || {}).reduce(
    (sum, count) => sum + (count || 0),
    0
  )

  // Handle like button press
  const handleLikePress = async () => {
    try {
      const newReaction = await toggleLike()
      if (onUpdatePost) {
        onUpdatePost({
          current_user_reaction: newReaction,
          reactions_summary: {
            ...post.reactions_summary,
            like: (post.reactions_summary.like || 0) + (newReaction ? 1 : -1)
          }
        })
      }
    } catch (err) {
      toast.toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        type: "error"
      })
    }
  }

  // Handle comment button press with error handling
  const handleCommentPress = () => {
    setShowComments(!showComments)
    if (!showComments) {
      try {
        refreshComments()
      } catch (err) {
        console.error("Error refreshing comments:", err)
        toast.toast({
          title: "Error",
          description: "Could not load comments. Please try again later.",
          type: "error"
        })
      }
    }
  }

  // Handle posting a new comment with better error handling
  const handlePostComment = async () => {
    if (!commentText.trim()) return
    
    try {
      await addComment(commentText)
      setCommentText("")
      toast.toast({
        title: "Success",
        description: "Comment posted successfully!",
        type: "success"
      })
      
      if (onUpdatePost) {
        onUpdatePost({
          comments_count: post.comments_count + 1
        })
      }
    } catch (err) {
      toast.toast({
        title: "Error",
        description: "Failed to post comment. The API endpoint might not be available yet.",
        type: "error"
      })
    }
  }

  // Handle edit post
  const handleEditPost = () => {
    setShowDropdownMenu(false)
    setIsEditing(true)
    setEditContent(post.content || "")
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.toast({
        title: "Error",
        description: "Post content cannot be empty",
        type: "error"
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append('content', editContent.trim())
      
      const updatedPost = await FeedsApi.updatePost(post.id, formData)
      
      if (onUpdatePost) {
        onUpdatePost({ content: editContent.trim() })
      }
      
      setIsEditing(false)
      toast.toast({
        title: "Success",
        description: "Post updated successfully!",
        type: "success"
      })
    } catch (err) {
      console.error("Error updating post:", err)
      toast.toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        type: "error"
      })
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(post.content || "")
  }

  // Handle delete post
  const handleDeletePost = () => {
    setShowDropdownMenu(false)
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true)
            try {
              await FeedsApi.deletePost(post.id)
              
              if (onDeletePost) {
                onDeletePost(post.id)
              }
              
              toast.toast({
                title: "Success",
                description: "Post deleted successfully!",
                type: "success"
              })
            } catch (err) {
              console.error("Error deleting post:", err)
              toast.toast({
                title: "Error",
                description: "Failed to delete post. Please try again.",
                type: "error"
              })
            } finally {
              setIsDeleting(false)
            }
          }
        }
      ]
    )
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Author section */}
      <View style={styles.header}>
        <View style={styles.authorContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.highlight }]}>
            {post.author_profile_pic ? (
              <Image
                source={{ uri: post.author_profile_pic }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={20} color={colors.muted} />
            )}
          </View>
          <View>
            <View style={styles.authorNameContainer}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {post.author_name}
              </Text>
              {post.author_user_type && (
                <View style={[styles.authorTypeBadge, { backgroundColor: post.author_user_type === 'therapist' ? '#4CAF50' : '#2196F3' }]}>
                  <Text style={styles.authorTypeBadgeText}>
                    {post.author_user_type.charAt(0).toUpperCase() + post.author_user_type.slice(1)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.date, { color: colors.muted }]}>
              {formattedDate}
            </Text>
          </View>
        </View>
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => setShowDropdownMenu(!showDropdownMenu)}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} />
          </TouchableOpacity>
          {showDropdownMenu && (
            <View style={[styles.dropdownMenu, { 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              shadowColor: colors.text 
            }]}>
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={handleEditPost}
              >
                <Ionicons name="create-outline" size={16} color={colors.text} />
                <Text style={[styles.dropdownText, { color: colors.text }]}>Edit Post</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={handleDeletePost}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.danger} />
                ) : (
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                )}
                <Text style={[styles.dropdownText, { color: colors.danger }]}>
                  {isDeleting ? "Deleting..." : "Delete Post"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Post content */}
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.editInput, { 
              color: colors.text, 
              borderColor: colors.border,
              backgroundColor: colors.background 
            }]}
            value={editContent}
            onChangeText={setEditContent}
            multiline
            placeholder="What's on your mind?"
            placeholderTextColor={colors.muted}
            maxLength={1000}
          />
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: colors.muted }]}
              onPress={handleCancelEdit}
            >
              <Text style={[styles.editButtonText, { color: colors.background }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveEdit}
            >
              <Text style={[styles.editButtonText, { color: colors.background }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity activeOpacity={0.9} onPress={() => setExpanded(!expanded)}>
          <Text
            style={[styles.content, { color: colors.text }]}
            numberOfLines={expanded ? undefined : 4}
          >
            {post.content}
          </Text>
          {!expanded && post.content && post.content.length > 300 && (
            <Text style={[styles.readMore, { color: colors.primary }]}>
              Read more
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Enhanced Media display with better video support */}
      {hasMedia && firstMedia && (
        <View style={styles.mediaContainer}>
          {!isVideo ? (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => setShowMediaViewer(true)}
            >
              <Animated.Image
                source={{ uri: firstMedia.file }}
                style={[
                  styles.media,
                  { opacity: imageLoaded ? 1 : 0.3, height: windowWidth * 0.6 },
                ]}
                onLoad={handleImageLoad}
                resizeMode="cover"
              />
              {/* Replace image loading indicators with LoadingSpinner */}
              {!imageLoaded && (
                <View style={styles.loader}>
                  <LoadingSpinner visible={true} />
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View
              style={styles.videoContainer}
            >
              <VideoView
                player={videoPlayer}
                style={[styles.media, { height: windowWidth * 0.6 }]}
                allowsFullscreen
                nativeControls={false}
              />
              <View style={styles.videoControls}>
                <TouchableOpacity
                  style={styles.muteButton}
                  onPress={toggleMute}
                >
                  <Ionicons 
                    name={isMuted ? "volume-mute" : "volume-high"} 
                    size={20} 
                    color="white" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.fullScreenButton}
                  onPress={() => setShowMediaViewer(true)}
                >
                  <Ionicons name="expand-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
              
              {/* Invisible overlay for opening media viewer but preserving autoplay */}
              <TouchableOpacity
                style={styles.videoOverlay}
                activeOpacity={0.95}
                onPress={() => setShowMediaViewer(true)}
              />
            </View>
          )}
        </View>
      )}

      {/* Enhanced Post metrics */}
      <View style={[styles.metrics, { borderTopColor: colors.border }]}>
        <View style={styles.metric}>
          <TouchableOpacity 
            style={[styles.metricButton, { backgroundColor: userReaction ? `${colors.danger}15` : 'transparent' }]}
            onPress={handleLikePress}
            disabled={reactionLoading}
          >
            <Ionicons 
              name={userReaction ? "heart" : "heart-outline"} 
              size={22} 
              color={userReaction ? colors.danger : colors.muted} 
            />
          </TouchableOpacity>
          <Text style={[styles.metricText, { color: colors.muted }]}>
            {reactionsCount > 0 ? reactionsCount : ""}
          </Text>
        </View>

        <View style={styles.metric}>
          <TouchableOpacity 
            style={[styles.metricButton, { backgroundColor: showComments ? `${colors.primary}15` : 'transparent' }]}
            onPress={handleCommentPress}
          >
            <Ionicons 
              name={showComments ? "chatbubble" : "chatbubble-outline"} 
              size={20} 
              color={showComments ? colors.primary : colors.muted} 
            />
          </TouchableOpacity>
          <Text style={[styles.metricText, { color: colors.muted }]}>
            {post.comments_count > 0 ? post.comments_count : ""}
          </Text>
        </View>

        <View style={styles.metric}>
          <TouchableOpacity 
            style={styles.metricButton}
            onPress={() => {
              toast.toast({
                title: "Share Feature",
                description: "Coming soon! Sharing will be available in a future update.",
                type: "info"
              })
            }}
          >
            <Ionicons name="share-outline" size={22} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Enhanced Comments section */}
      {showComments && (
        <View style={[styles.commentsSection, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
          {commentsLoading ? (
            <View style={styles.loadingComments}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 8 }}>Loading comments...</Text>
            </View>
          ) : comments.length > 0 ? (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={[styles.commentAvatar, { backgroundColor: colors.highlight }]}>
                    {item.author_profile_pic ? (
                      <Image
                        source={{ uri: item.author_profile_pic }}
                        style={styles.commentAvatarImage}
                      />
                    ) : (
                      <Ionicons name="person" size={12} color={colors.muted} />
                    )}
                  </View>
                  <View style={styles.commentContent}>
                    <Text style={[styles.commentAuthor, { color: colors.text }]}>
                      {item.author_name}
                    </Text>
                    <Text style={[styles.commentText, { color: colors.text }]}>
                      {item.content}
                    </Text>
                    <Text style={[styles.commentDate, { color: colors.muted }]}>
                      {format(new Date(item.created_at), "MMM d, yyyy • h:mm a")}
                    </Text>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.commentsList}
            />
          ) : (
            <Text style={[styles.noComments, { color: colors.muted }]}>
              No comments yet. Be the first to comment!
            </Text>
          )}
          
          {/* Enhanced Add new comment */}
          <View style={[styles.addCommentContainer, { borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.commentInput, { color: colors.text, backgroundColor: colors.highlight, borderColor: colors.border }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.muted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.postCommentButton,
                { 
                  backgroundColor: colors.primary, 
                  opacity: commentText.trim() ? 1 : 0.5,
                  ...styles.buttonShadow
                }
              ]}
              onPress={handlePostComment}
              disabled={!commentText.trim()}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Media Viewer Modal */}
      {hasMedia && firstMedia && (
        <MediaViewerModal
          visible={showMediaViewer}
          onClose={() => setShowMediaViewer(false)}
          mediaUrl={firstMedia.file}
          mediaType={isVideo ? "video" : "image"}
          title={post.author_name}
        />
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorName: {
    fontWeight: "600",
    fontSize: 15,
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorTypeBadge: {
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorTypeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
    borderRadius: 16,
  },
  menuContainer: {
    position: 'relative',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  videoControls: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  muteButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    marginRight: 8,
  },
  fullScreenButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 15,
    lineHeight: 22,
  },
  readMore: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  mediaContainer: {
    width: "100%",
    position: 'relative',
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  media: {
    width: "100%",
    height: 300,
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  metrics: {
    flexDirection: "row",
    borderTopWidth: 1,
    padding: 12,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  metricButton: {
    padding: 8,
    borderRadius: 20,
  },
  metricText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  commentsSection: {
    padding: 12,
  },
  loadingComments: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  commentsList: {
    paddingBottom: 10,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  commentAvatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentDate: {
    fontSize: 11,
    marginTop: 3,
  },
  noComments: {
    textAlign: 'center',
    padding: 15,
    fontSize: 14,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  postCommentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  editContainer: {
    marginVertical: 8,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
})

export default PostItem;
