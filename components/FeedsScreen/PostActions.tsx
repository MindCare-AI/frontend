"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import { useToast } from "../../contexts/feeds/ToastContext"

interface PostActionsProps {
  postId: number
  userReaction: string | null
  onReactionChange: (reaction: string | null) => void
  onCommentToggle: () => void
  onShare: () => void
  totalReactions: number
  commentsCount: number
  isSaved: boolean
  onSaveToggle: (saved: boolean) => void
}

const PostActions: React.FC<PostActionsProps> = ({
  postId,
  userReaction,
  onReactionChange,
  onCommentToggle,
  onShare,
  totalReactions,
  commentsCount,
  isSaved,
  onSaveToggle,
}) => {
  const { colors, isDark } = useTheme()
  const {toast} = useToast()
  const [showReactions, setShowReactions] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const handleReport = (reason: string) => {
    setShowReportModal(false)
    toast({
      title: "Post reported",
      description: "Thank you for helping keep our community safe",
      type: "success",
    })
  }

  const renderReactionsPopup = () => {
    if (!showReactions) return null

    return (
      <View
        style={[
          styles.reactionsPopup,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: {
                elevation: 4,
              },
              web: {
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              },
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.reactionButton, userReaction === "like" && { backgroundColor: "#1877F2" + "20" }]}
          onPress={() => {
            onReactionChange(userReaction === "like" ? null : "like")
            setShowReactions(false)
          }}
        >
          <Ionicons name="thumbs-up" size={24} color={userReaction === "like" ? "#1877F2" : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reactionButton, userReaction === "love" && { backgroundColor: "#E41E3F" + "20" }]}
          onPress={() => {
            onReactionChange(userReaction === "love" ? null : "love")
            setShowReactions(false)
          }}
        >
          <Ionicons name="heart" size={24} color={userReaction === "love" ? "#E41E3F" : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reactionButton, userReaction === "support" && { backgroundColor: "#0A8754" + "20" }]}
          onPress={() => {
            onReactionChange(userReaction === "support" ? null : "support")
            setShowReactions(false)
          }}
        >
          <Ionicons name="trophy" size={24} color={userReaction === "support" ? "#0A8754" : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reactionButton, userReaction === "insightful" && { backgroundColor: "#8B5CF6" + "20" }]}
          onPress={() => {
            onReactionChange(userReaction === "insightful" ? null : "insightful")
            setShowReactions(false)
          }}
        >
          <Ionicons name="bulb" size={24} color={userReaction === "insightful" ? "#8B5CF6" : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reactionButton, userReaction === "celebrate" && { backgroundColor: "#F59E0B" + "20" }]}
          onPress={() => {
            onReactionChange(userReaction === "celebrate" ? null : "celebrate")
            setShowReactions(false)
          }}
        >
          <Ionicons name="gift" size={24} color={userReaction === "celebrate" ? "#F59E0B" : colors.text} />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View
      style={[
        styles.container,
        {
          borderTopColor: colors.border,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {renderReactionsPopup()}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowReactions(true)}
          onLongPress={() => onReactionChange(userReaction ? null : "like")}
        >
          <Ionicons
            name="thumbs-up"
            size={20}
            color={userReaction ? colors.primary : colors.muted}
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, { color: userReaction ? colors.primary : colors.muted }]}>
            {totalReactions > 0 ? `${totalReactions} ` : ""}Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onCommentToggle}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.muted} style={styles.actionIcon} />
          <Text style={[styles.actionText, { color: colors.muted }]}>
            {commentsCount > 0 ? `${commentsCount} ` : ""}Comment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color={colors.muted} style={styles.actionIcon} />
          <Text style={[styles.actionText, { color: colors.muted }]}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => onSaveToggle(!isSaved)}>
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isSaved ? colors.success : colors.muted}
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, { color: isSaved ? colors.success : colors.muted }]}>
            {isSaved ? "Saved" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Report this post?</Text>
              <Text style={[styles.modalDescription, { color: colors.muted }]}>
                This will send a report to our moderation team. Please select a reason for reporting:
              </Text>
            </View>

            {["Spam", "Harassment", "False information", "Hate speech", "Violence", "Other"].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reportOption,
                  {
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleReport(reason)}
              >
                <Ionicons name="alert-circle" size={20} color={colors.danger} style={styles.reportIcon} />
                <Text style={[styles.reportText, { color: colors.text }]}>{reason}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowReportModal(false)}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colors.danger,
                  },
                ]}
                onPress={() => handleReport("Other")}
              >
                <Text style={{ color: "white" }}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  reactionsPopup: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 8,
    position: "absolute",
    top: -50,
    left: 16,
    zIndex: 10,
    borderWidth: 1,
  },
  reactionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  reportOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  reportIcon: {
    marginRight: 12,
  },
  reportText: {
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
  },
})

export default PostActions
