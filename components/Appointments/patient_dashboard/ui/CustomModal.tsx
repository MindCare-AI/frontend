"use client"

import type React from "react"
import { View, Text, Pressable, StyleSheet, Platform, Dimensions, ScrollView } from "react-native"
import { useTheme } from "native-base"
import { Ionicons } from "@expo/vector-icons"
import RNModal from "react-native-modal"

interface CustomModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  closeOnOverlayClick?: boolean
  style?: any
}

// This component wraps the third-party react-native-modal with a more modern implementation
// that avoids using deprecated components like TouchableWithoutFeedback
export const CustomModal: React.FC<CustomModalProps> = ({
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

  // Custom backdrop component to replace TouchableWithoutFeedback
  const renderBackdrop = () => {
    return (
      <Pressable 
        style={styles.backdrop}
        onPress={closeOnOverlayClick ? onClose : undefined}
      />
    );
  };

  return (
    <RNModal
      isVisible={isOpen}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      useNativeDriver
      hideModalContentWhileAnimating
      style={[styles.modal, { margin: 0 }]}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
      // Instead of using the default backdrop with TouchableWithoutFeedback
      // we provide our own custom backdrop component
      customBackdrop={renderBackdrop()}
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
          {typeof children === 'string' ? <Text>{children}</Text> : children}
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
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(74, 144, 226, 0.15)",
    backgroundColor: "rgba(74, 144, 226, 0.05)",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
    color: "#4a90e2", // Using primary color
    letterSpacing: 0.3,
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
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(74, 144, 226, 0.15)",
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "rgba(74, 144, 226, 0.05)",
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
})
