"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native"
import { formatDistanceToNow } from "date-fns"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import { useComments } from "../../hooks/feeds/useComments"
import { Avatar } from "../common/Avatar"
import LoadingSpinner from "../LoadingSpinner"

interface CommentSectionProps {
  postId: number
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { colors, isDark } = useTheme()
  const [newComment, setNewComment] = useState("")
  const [replyContent, setReplyContent] = useState("")

  const {
    comments,
    loading,
    error,
    expandedComments,
    replyingTo,
    setReplyingTo,
    addComment,
    addReply,
    toggleReplies,
    reactToComment
  } = useComments(postId);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    try {
      await addComment(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

  const handleAddReply = async (commentId: number) => {
    if (!replyContent.trim() || !replyingTo) return
    
    try {
      await addReply(commentId, replyContent);
      setReplyContent("");
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  }

  const handleReaction = async (commentId: number) => {
    try {
      await reactToComment(commentId, "like");
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  }

  const renderComment = ({ item }: { item: any }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentContent}>
        <Avatar source={item.author_profile_pic} name={item.author_name} size="sm" />
        <View style={styles.commentBody}>
          <View
            style={[
              styles.commentBubble,
              {
                backgroundColor: isDark ? colors.highlight : "#F0F0F0",
              },
            ]}
          >
            <View style={styles.commentHeader}>
              <Text style={[styles.authorName, { color: colors.text }]}>{item.author_name}</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.commentText, { color: colors.text }]}>{item.content}</Text>
          </View>
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.commentAction} onPress={() => handleReaction(item.id)}>
              <Ionicons
                name="thumbs-up"
                size={14}
                color={item.current_user_reaction === "like" ? colors.primary : colors.muted}
              />
              {item.reactions_count > 0 && (
                <Text
                  style={[styles.actionText, { color: item.current_user_reaction === "like" ? colors.primary : colors.muted }]}
                >
                  {item.reactions_count}
                </Text>
              )}
              <Text
                style={[styles.actionText, { color: item.current_user_reaction === "like" ? colors.primary : colors.muted }]}
              >
                Like
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.commentAction}
              onPress={() => setReplyingTo(replyingTo === item.id ? null : item.id)}
            >
              <Ionicons name="chatbubble-outline" size={14} color={colors.muted} />
              <Text style={[styles.actionText, { color: colors.muted }]}>Reply</Text>
            </TouchableOpacity>
            <Text style={[styles.timestamp, { color: colors.muted }]}>
              {formatDate(item.created_at)}
              {item.is_edited && " (edited)"}
            </Text>
          </View>

          {/* Reply form */}
          {replyingTo === item.id && (
            <View style={styles.replyForm}>
              <Avatar size="sm" name="You" />
              <View style={styles.replyInputContainer}>
                <TextInput
                  style={[
                    styles.replyInput,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: isDark ? colors.highlight : "#F0F0F0",
                    },
                  ]}
                  placeholder={`Reply to ${item.author_name}...`}
                  placeholderTextColor={colors.muted}
                  value={replyContent}
                  onChangeText={setReplyContent}
                  multiline
                />
                <View style={styles.replyButtons}>
                  <TouchableOpacity
                    style={[
                      styles.replyButton,
                      {
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setReplyingTo(null)}
                  >
                    <Text style={{ color: colors.text }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.replyButton,
                      {
                        backgroundColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleAddReply(item.id)}
                    disabled={!replyContent.trim()}
                  >
                    <Text style={{ color: "white" }}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Replies */}
          {item.replies_count > 0 && !expandedComments[item.id] && (
            <TouchableOpacity style={styles.viewReplies} onPress={() => toggleReplies(item.id)}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.muted} />
              <Text style={[styles.viewRepliesText, { color: colors.muted }]}>
                View {item.replies_count} {item.replies_count === 1 ? "reply" : "replies"}
              </Text>
            </TouchableOpacity>
          )}

          {expandedComments[item.id] && item.replies && (
            <View style={[styles.repliesList, { borderLeftColor: colors.border }]}>
              {item.replies.map((reply: any) => (
                <View key={reply.id} style={styles.replyItem}>
                  <Avatar size="sm" source={reply.author_profile_pic} name={reply.author_name} />
                  <View style={styles.replyBody}>
                    <View
                      style={[
                        styles.commentBubble,
                        {
                          backgroundColor: isDark ? colors.highlight : "#F0F0F0",
                        },
                      ]}
                    >
                      <View style={styles.commentHeader}>
                        <Text style={[styles.authorName, { color: colors.text }]}>{reply.author_name}</Text>
                      </View>
                      <Text style={[styles.commentText, { color: colors.text }]}>{reply.content}</Text>
                    </View>
                    <View style={styles.commentActions}>
                      <TouchableOpacity
                        style={styles.commentAction}
                        onPress={() => handleReaction(reply.id)}
                      >
                        <Ionicons
                          name="thumbs-up"
                          size={14}
                          color={reply.current_user_reaction === "like" ? colors.primary : colors.muted}
                        />
                        {reply.reactions_count > 0 && (
                          <Text
                            style={[
                              styles.actionText,
                              { color: reply.current_user_reaction === "like" ? colors.primary : colors.muted },
                            ]}
                          >
                            {reply.reactions_count}
                          </Text>
                        )}
                        <Text
                          style={[
                            styles.actionText,
                            { color: reply.current_user_reaction === "like" ? colors.primary : colors.muted },
                          ]}
                        >
                          Like
                        </Text>
                      </TouchableOpacity>
                      <Text style={[styles.timestamp, { color: colors.muted }]}>
                        {formatDate(reply.created_at)}
                        {reply.is_edited && " (edited)"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.hideReplies} onPress={() => toggleReplies(item.id)}>
                <Text style={[styles.hideRepliesText, { color: colors.muted }]}>Hide replies</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  )

  if (loading && comments.length === 0) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <LoadingSpinner visible={true} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.danger }}>Failed to load comments</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          borderTopColor: colors.border,
        },
      ]}
    >
      {/* Add comment form */}
      <View style={styles.commentForm}>
        <Avatar size="sm" name="You" />
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: isDark ? colors.highlight : "#F0F0F0",
              },
            ]}
            placeholder="Write a comment..."
            placeholderTextColor={colors.muted}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.postButton,
              {
                backgroundColor: colors.primary,
                opacity: newComment.trim() ? 1 : 0.5,
              },
            ]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments list */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.commentsList}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
  },
  commentForm: {
    flexDirection: "row",
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    minHeight: 40,
    fontSize: 14,
  },
  postButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  postButtonText: {
    color: "white",
    fontWeight: "500",
  },
  commentsList: {
    paddingBottom: 16,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentContent: {
    flexDirection: "row",
  },
  commentBody: {
    flex: 1,
    marginLeft: 8,
  },
  commentBubble: {
    borderRadius: 16,
    padding: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "500",
  },
  commentText: {
    fontSize: 14,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingLeft: 2,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  replyForm: {
    flexDirection: "row",
    marginTop: 8,
  },
  replyInputContainer: {
    flex: 1,
    marginLeft: 8,
  },
  replyInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    minHeight: 40,
    fontSize: 14,
  },
  replyButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  replyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 1,
  },
  viewReplies: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 4,
  },
  viewRepliesText: {
    fontSize: 12,
    marginLeft: 4,
  },
  repliesList: {
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 1,
  },
  replyItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  replyBody: {
    flex: 1,
    marginLeft: 8,
  },
  hideReplies: {
    marginTop: 8,
  },
  hideRepliesText: {
    fontSize: 12,
  },
})

export default CommentSection
