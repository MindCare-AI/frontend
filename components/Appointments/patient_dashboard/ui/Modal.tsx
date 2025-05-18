"use client"

import type React from "react"
import { View, Text, Pressable, StyleSheet, Platform, Dimensions, ScrollView } from "react-native"
import { useTheme } from "native-base"
import { Ionicons } from "@expo/vector-icons"
import RNModal from "react-native-modal"

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
  const { width: screenWidth } = Dimensions.get("window")

  const getWidth = () => {
    if (Platform.OS !== "web") return "90%"

    switch (size) {
      case "sm":
        return Math.min(384, screenWidth * 0.9)
      case "md":
        return Math.min(512, screenWidth * 0.9)
      case "lg":
        return Math.min(640, screenWidth * 0.9)
      case "xl":
        return Math.min(768, screenWidth * 0.9)
      case "full":
        return "100%"
      default:
        return Math.min(512, screenWidth * 0.9)
    }
  }

  return (
    <RNModal
      isVisible={isOpen}
      onBackdropPress={closeOnOverlayClick ? onClose : undefined}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      useNativeDriver
      hideModalContentWhileAnimating
      style={[styles.modal, { margin: 0 }]}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
    >
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
      >
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
              accessibilityHint="Closes the modal dialog"
            >
              <Ionicons name="close" size={24} color={theme.colors.gray[500]} />
            </Pressable>
          </View>
        )}
        <ScrollView style={styles.content}>
          {children}
        </ScrollView>
        {footer && <View style={styles.footer}>{footer}</View>}
      </View>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  container: {
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: "90%",
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
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    maxHeight: Platform.OS === "web" ? "70%" : "70%",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
})
