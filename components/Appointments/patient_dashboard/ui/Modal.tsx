"use client"

import type React from "react"
import { Modal as RNModal, View, Text, Pressable, StyleSheet, Platform } from "react-native"
import { useTheme } from "native-base"
import { Ionicons } from "@expo/vector-icons"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  closeOnOverlayClick?: boolean
  style?: any
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  style,
}) => {
  const theme = useTheme()

  const getWidth = () => {
    if (Platform.OS !== "web") return "100%"

    switch (size) {
      case "sm":
        return "384px"
      case "md":
        return "512px"
      case "lg":
        return "640px"
      case "xl":
        return "768px"
      case "full":
        return "100%"
      default:
        return "512px"
    }
  }

  const handleOverlayPress = () => {
    if (closeOnOverlayClick) {
      onClose()
    }
  }

  return (
    <RNModal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={handleOverlayPress}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.white,
              width: getWidth(),
              maxWidth: Platform.OS === "web" ? getWidth() : "90%",
            },
            style,
          ]}
          // This prevents the modal from closing when clicking inside it
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.gray[500]} />
              </Pressable>
            </View>
          )}
          <View style={styles.content}>{children}</View>
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </Pressable>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
})
