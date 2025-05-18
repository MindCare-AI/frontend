"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native"
import { formatDistanceToNow } from "date-fns"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import Avatar from "./ui/Avatar"
import { MOCK_COMMENTS } from "../../data/feeds/mockData"
import type { Comment } from "../../types/feeds/feed"

interface CommentSectionProps {
  postId: string
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { colors, isDark } = useTheme()
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [newComment, setNewComment] = useState("")
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleAddComment = () => {
    if (!newComment.trim()) return

    // In a real app, you would call an API to add the comment
    const comment: Comment = {
      id: `comment${Date.now()}`,
      author: {
        id: "currentUser",
        name: "Current User",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      content: newComment,
      created_at: new Date().toISOString(),
      is_edited: false,
      reactions: {
        like: 0,
      },
      user_reaction: null,
      replies_count: 0,
      replies: [],
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const handleAddReply = (commentId: string) => {
    if (!replyContent.trim()) return

    // In a real app, you would call an API to add the reply
    const reply: Comment = {
      id: `reply${Date.now()}`,
      author: {
        id: "currentUser",
        name: "Current User",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      content: replyContent,
      created_at: new Date().toISOString(),
      is_edited: false,
      reactions: {
        like: 0,
      },
      user_reaction: null,
      replies_count: 0,
    }

    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
            replies_count: (comment.replies_count || 0) + 1,
          }
        }
        return comment
      }),
    )

    setReplyingTo(null)
    setReplyContent("")
  }

  const toggleReplies = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  const handleReaction = (commentId: string, isReply = false, parentId?: string) => {
    // In a real app, you would call an API to update the reaction
    if (isReply && parentId) {
      setComments(
        comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies?.map((reply) => {
                if (reply.id === commentId) {
                  const newReaction = reply.user_reaction === "like" ? null : "like"
                  const likeDelta = newReaction === "like" ? 1 : -1

                  return {
                    ...reply,
                    user_reaction: newReaction,
                    reactions: {
                      like: Math.max(0, reply.reactions.like + likeDelta),
                    },
                  }
                }
                return reply
              }),
            }
          }
          return comment
        }),
      )
    } else {
      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            const newReaction = comment.user_reaction === "like" ? null : "like"
            const likeDelta = newReaction === "like" ? 1 : -1

            return {
              ...comment,
              user_reaction: newReaction,
              reactions: {
                like: Math.max(0, comment.reactions.like + likeDelta),
              },
            }
          }
          return comment
        }),
      )
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentContent}>
        <Avatar source={item.author.avatar} name={item.author.name} size="small" />
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
              <Text style={[styles.authorName, { color: colors.text }]}>{item.author.name}</Text>
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
                color={item.user_reaction === "like" ? colors.primary : colors.muted}
              />
              {item.reactions.like > 0 && (
                <Text
                  style={[styles.actionText, { color: item.user_reaction === "like" ? colors.primary : colors.muted }]}
                >
                  {item.reactions.like}
                </Text>
              )}
              <Text
                style={[styles.actionText, { color: item.user_reaction === "like" ? colors.primary : colors.muted }]}
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
              <Avatar size="small" source="https://randomuser.me/api/portraits/men/1.jpg" name="Current User" />
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
                  placeholder={`Reply to ${item.author.name}...`}
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
              {item.replies.map((reply) => (
                <View key={reply.id} style={styles.replyItem}>
                  <Avatar size="small" source={reply.author.avatar} name={reply.author.name} />
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
                        <Text style={[styles.authorName, { color: colors.text }]}>{reply.author.name}</Text>
                        <TouchableOpacity>
                          <Ionicons name="ellipsis-horizontal" size={16} color={colors.muted} />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.commentText, { color: colors.text }]}>{reply.content}</Text>
                    </View>
                    <View style={styles.commentActions}>
                      <TouchableOpacity
                        style={styles.commentAction}
                        onPress={() => handleReaction(reply.id, true, item.id)}
                      >
                        <Ionicons
                          name="thumbs-up"
                          size={14}
                          color={reply.user_reaction === "like" ? colors.primary : colors.muted}
                        />
                        {reply.reactions.like > 0 && (
                          <Text
                            style={[
                              styles.actionText,
                              { color: reply.user_reaction === "like" ? colors.primary : colors.muted },
                            ]}
                          >
                            {reply.reactions.like}
                          </Text>
                        )}
                        <Text
                          style={[
                            styles.actionText,
                            { color: reply.user_reaction === "like" ? colors.primary : colors.muted },
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
        <Avatar size="small" source="https://randomuser.me/api/portraits/men/1.jpg" name="Current User" />
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
        keyExtractor={(item) => item.id}
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
