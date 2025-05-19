"use client"

import React, { useState } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Dimensions, FlatList, TextInput, ActivityIndicator } from "react-native"
import { Video, ResizeMode } from "expo-av" // Import ResizeMode type
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import { Post } from "../../types/feeds"
import { format } from "date-fns"
import { usePostReactions } from "../../hooks/feeds/usePostReactions"
import { useComments } from "../../hooks/feeds/useComments"
import { useToast } from "../../contexts/feeds/ToastContext"

interface PostItemProps {
  post: Post
  onUpdatePost: (updates: Partial<Post>) => void
}

const PostItem: React.FC<PostItemProps> = ({ post, onUpdatePost }) => {
  const { colors, isDark } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
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

  // Check if post has media
  const hasMedia = post.media_files && post.media_files.length > 0
  // Fix the TypeScript error by using optional chaining and providing a fallback
  const firstMedia = post.media_files?.[0] || null
  const isVideo = firstMedia && firstMedia.media_type.includes("video")

  // Handle like button press
  const handleLikePress = async () => {
    try {
      const newReaction = await toggleLike()
      // Update the post with the new reaction
      onUpdatePost({
        current_user_reaction: newReaction,
        reactions_summary: {
          ...post.reactions_summary,
          like: (post.reactions_summary.like || 0) + (newReaction ? 1 : -1)
        }
      })
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
      
      // Update the comment count on the post
      onUpdatePost({
        comments_count: post.comments_count + 1
      })
    } catch (err) {
      toast.toast({
        title: "Error",
        description: "Failed to post comment. The API endpoint might not be available yet.",
        type: "error"
      })
    }
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
          <Image
            source={
              post.author_profile_pic
                ? { uri: post.author_profile_pic }
                : require("../../assets/default-avatar.png")
            }
            style={styles.avatar}
          />
          <View>
            <Text style={[styles.authorName, { color: colors.text }]}>
              {post.author_name}
            </Text>
            <Text style={[styles.date, { color: colors.muted }]}>
              {formattedDate}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Post content */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => setExpanded(!expanded)}>
        <Text
          style={[styles.content, { color: colors.text }]}
          numberOfLines={expanded ? undefined : 4}
        >
          {post.content}
        </Text>
        {!expanded && post.content.length > 300 && (
          <Text style={[styles.readMore, { color: colors.primary }]}>
            Read more
          </Text>
        )}
      </TouchableOpacity>

      {/* Media display */}
      {hasMedia && firstMedia && (
        <View style={styles.mediaContainer}>
          {!isVideo ? (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => {
                // TODO: Open image viewer
              }}
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
              {!imageLoaded && (
                <View style={[styles.loader, { backgroundColor: colors.highlight }]}>
                  <Text style={{ color: colors.muted }}>Loading...</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <Video
              source={{ uri: firstMedia.file }}
              style={[styles.media, { height: windowWidth * 0.6 }]}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN} // Use the enum value instead of string
              isLooping={false}
              posterSource={{ uri: firstMedia.file + "?thumb=1" }}
              posterStyle={styles.media}
              usePoster
            />
          )}
        </View>
      )}

      {/* Post metrics with working reactions */}
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <TouchableOpacity 
            style={styles.metricButton}
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
            style={styles.metricButton}
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
      
      {/* Comments section */}
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
                  <Image
                    source={
                      item.author_profile_pic
                        ? { uri: item.author_profile_pic }
                        : require("../../assets/default-avatar.png")
                    }
                    style={styles.commentAvatar}
                  />
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
          
          {/* Add new comment */}
          <View style={[styles.addCommentContainer, { borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.commentInput, { color: colors.text, backgroundColor: colors.highlight }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.muted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.postCommentButton,
                { backgroundColor: colors.primary, opacity: commentText.trim() ? 1 : 0.5 }
              ]}
              onPress={handlePostComment}
              disabled={!commentText.trim()}
            >
              <Text style={styles.postCommentText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorName: {
    fontWeight: "600",
    fontSize: 15,
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    fontSize: 15,
    lineHeight: 22,
  },
  readMore: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  mediaContainer: {
    width: "100%",
    backgroundColor: "#f0f0f0",
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
    borderTopColor: "#e0e0e0",
    padding: 10,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  metricButton: {
    padding: 6,
  },
  metricText: {
    marginLeft: 4,
    fontSize: 14,
  },
  commentsSection: {
    padding: 10,
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
    paddingTop: 10,
    marginTop: 5,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
  },
  postCommentButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postCommentText: {
    color: 'white',
    fontWeight: '600',
  },
})

export default PostItem
