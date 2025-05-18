"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, Share, Linking, Platform } from "react-native"
import { formatDistanceToNow } from "date-fns"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import { useToast } from "../../contexts/feeds/ToastContext"
import type { Post } from "../../types/feeds/feed"
import PostActions from "./PostActions"
import CommentSection from "./CommentSection"
import Card from "./ui/Card"
import Avatar from "./ui/Avatar"
import Badge from "./ui/Badge"
import ProgressBar from "./ui/ProgressBar"

interface PostItemProps {
  post: Post
  onUpdatePost: (updates: Partial<Post>) => void
}

const PostItem: React.FC<PostItemProps> = ({ post, onUpdatePost }) => {
  const { colors, isDark } = useTheme()
  const { toast } = useToast()
  const [showComments, setShowComments] = useState(false)
  const [userReaction, setUserReaction] = useState<string | null>(post.user_reaction)
  const [userPollVote, setUserPollVote] = useState<string | null>(post.user_poll_vote || null)
  const [isSaved, setIsSaved] = useState(post.is_saved)

  const totalReactions = Object.values(post.reactions).reduce((sum, count) => sum + count, 0)

  const handleReaction = (reactionType: string | null) => {
    // Update local state
    setUserReaction(reactionType)

    // Update parent component
    onUpdatePost({
      user_reaction: reactionType,
      // In a real app, you would update the reaction counts properly
      reactions: {
        ...post.reactions,
        [reactionType || "like"]: reactionType
          ? (post.reactions[reactionType as keyof typeof post.reactions] || 0) + 1
          : Math.max(0, (post.reactions[userReaction as keyof typeof post.reactions] || 1) - 1),
      },
    })
  }

  const handlePollVote = (optionId: string) => {
    if (!userPollVote) {
      // Update local state
      setUserPollVote(optionId)

      // Update parent component
      const updatedOptions = post.poll_options?.map((option) =>
        option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
      )

      onUpdatePost({
        user_poll_vote: optionId,
        poll_options: updatedOptions,
      })
    }
  }

  const handleSaveToggle = (saved: boolean) => {
    // Update local state
    setIsSaved(saved)

    // Update parent component
    onUpdatePost({ is_saved: saved })

    toast({
      title: saved ? "Post saved" : "Post removed from saved items",
      description: saved ? "You can find this post in your saved items" : "You can save it again anytime",
      type: "success",
    })
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  const totalPollVotes = post.poll_options?.reduce((sum, option) => sum + option.votes, 0) || 0

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post: ${post.content}\nhttps://example.com/posts/${post.id}`,
      })
    } catch (error) {
      console.error("Error sharing post:", error)
    }
  }

  const handleOpenLink = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url)
      } else {
        toast({
          title: "Cannot open URL",
          description: "The URL cannot be opened",
          type: "error",
        })
      }
    })
  }

  return (
    <Card style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Post Header - Author Info */}
      <View style={styles.header}>
        <View style={styles.authorContainer}>
          <Avatar source={post.author.avatar} name={post.author.name} size="medium" />
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: colors.text }]}>{post.author.name}</Text>
            <View style={styles.metaInfo}>
              <Text style={[styles.timestamp, { color: colors.muted }]}>{formatDate(post.created_at)}</Text>
              {post.topic && (
                <>
                  <Text style={[styles.dot, { color: colors.muted }]}>•</Text>
                  <Badge text={post.topic} />
                </>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.content}>
        <Text style={[styles.contentText, { color: colors.text }]}>{post.content}</Text>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag) => (
              <Badge key={tag} text={`#${tag}`} />
            ))}
          </View>
        )}

        {/* Media content */}
        {post.post_type === "image" && post.media_url && (
          <View style={styles.mediaContainer}>
            <Image source={{ uri: post.media_url }} style={styles.mediaImage} resizeMode="cover" />
          </View>
        )}

        {post.post_type === "video" && post.media_url && (
          <View style={styles.mediaContainer}>
            <View style={styles.videoPlaceholder}>
              <Text style={[styles.videoPlaceholderText, { color: colors.muted }]}>Video player would be here</Text>
              <Image
                source={{ uri: post.media_url }}
                style={[styles.mediaImage, { opacity: 0.7 }]}
                resizeMode="cover"
              />
              <View style={styles.playButton}>
                <Ionicons name="play" size={40} color="white" />
              </View>
            </View>
          </View>
        )}

        {/* Link preview */}
        {post.link_url && (
          <TouchableOpacity
            style={[styles.linkContainer, { backgroundColor: isDark ? colors.highlight : "#F5F5F5" }]}
            onPress={() => handleOpenLink(post.link_url || "")}
          >
            <View style={styles.linkContent}>
              <Text style={[styles.linkText, { color: colors.text }]} numberOfLines={1}>
                {post.link_url}
              </Text>
              <Text style={[styles.linkSubtext, { color: colors.muted }]}>Click to open link</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Poll */}
        {post.post_type === "poll" && post.poll_options && (
          <View style={styles.pollContainer}>
            {post.poll_options.map((option) => {
              const percentage = totalPollVotes > 0 ? Math.round((option.votes / totalPollVotes) * 100) : 0

              return (
                <View key={option.id} style={styles.pollOption}>
                  <TouchableOpacity
                    style={[
                      styles.pollButton,
                      {
                        backgroundColor: userPollVote === option.id ? colors.primary : "transparent",
                        borderColor: userPollVote === option.id ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handlePollVote(option.id)}
                    disabled={!!userPollVote && userPollVote !== option.id}
                  >
                    <Text
                      style={[
                        styles.pollButtonText,
                        {
                          color: userPollVote === option.id ? "white" : colors.text,
                        },
                      ]}
                    >
                      {option.text}
                    </Text>
                    <Text
                      style={[
                        styles.pollPercentage,
                        {
                          color: userPollVote === option.id ? "white" : colors.text,
                        },
                      ]}
                    >
                      {percentage}%
                    </Text>
                  </TouchableOpacity>
                  <ProgressBar
                    progress={percentage}
                    height={4}
                    progressColor={userPollVote === option.id ? colors.primary : colors.border}
                    style={styles.pollProgress}
                  />
                  <Text style={[styles.pollVotes, { color: colors.muted }]}>{option.votes} votes</Text>
                </View>
              )
            })}
            <Text style={[styles.pollTotal, { color: colors.muted }]}>Total votes: {totalPollVotes}</Text>
          </View>
        )}
      </View>

      {/* Post Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.reactionStats}>
          {userReaction && (
            <View style={styles.reactionIcon}>
              {userReaction === "like" && (
                <View style={[styles.reactionBubble, { backgroundColor: "#1877F2" + "20" }]}>
                  <Ionicons name="thumbs-up" size={12} color="#1877F2" />
                </View>
              )}
              {userReaction === "love" && (
                <View style={[styles.reactionBubble, { backgroundColor: "#E41E3F" + "20" }]}>
                  <Ionicons name="heart" size={12} color="#E41E3F" />
                </View>
              )}
            </View>
          )}
          {totalReactions > 0 && (
            <Text style={[styles.statsText, { color: colors.muted }]}>{totalReactions} reactions</Text>
          )}
        </View>
        <View style={styles.engagementStats}>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.muted} />
            <Text style={[styles.statsText, { color: colors.muted }]}>{post.comments_count} comments</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={14} color={colors.muted} />
            <Text style={[styles.statsText, { color: colors.muted }]}>{post.views_count} views</Text>
          </View>
        </View>
      </View>

      {/* Post Actions */}
      <PostActions
        postId={post.id}
        userReaction={userReaction}
        onReactionChange={handleReaction}
        onCommentToggle={() => setShowComments(!showComments)}
        onShare={handleShare}
        totalReactions={totalReactions}
        commentsCount={post.comments_count}
        isSaved={isSaved}
        onSaveToggle={handleSaveToggle}
      />

      {/* Comments Section */}
      {showComments && <CommentSection postId={post.id} />}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorInfo: {
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  dot: {
    marginHorizontal: 4,
    fontSize: 12,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  mediaContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 12,
  },
  mediaImage: {
    width: "100%",
    height: 300,
  },
  videoPlaceholder: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  videoPlaceholderText: {
    position: "absolute",
    zIndex: 1,
    fontSize: 14,
  },
  playButton: {
    position: "absolute",
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 40,
    padding: 8,
  },
  linkContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 12,
  },
  linkContent: {
    padding: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
  },
  linkSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  pollContainer: {
    marginVertical: 12,
  },
  pollOption: {
    marginBottom: 12,
  },
  pollButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  pollButtonText: {
    fontSize: 14,
  },
  pollPercentage: {
    fontSize: 14,
    fontWeight: "500",
  },
  pollProgress: {
    marginBottom: 4,
  },
  pollVotes: {
    fontSize: 12,
    textAlign: "right",
  },
  pollTotal: {
    fontSize: 14,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reactionStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionIcon: {
    marginRight: 4,
  },
  reactionBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  engagementStats: {
    flexDirection: "row",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  statsText: {
    fontSize: 12,
    marginLeft: 4,
  },
})

export default PostItem
