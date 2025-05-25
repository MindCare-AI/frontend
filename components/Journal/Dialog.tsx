import type React from "react"
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
} from "react-native"
import { colors, spacing, borderRadius, fontSizes, shadows } from "./theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRef, useEffect } from "react"

interface DialogProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  enhanced?: boolean
}

const { width, height } = Dimensions.get("window")

export function Dialog({ visible, onClose, title, children, footer, enhanced = false }: DialogProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      // Reset animations
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)
      slideAnim.setValue(50)
    }
  }, [visible])

  const handleClose = () => {
    if (enhanced) {
      // Animate out before closing
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose()
      })
    } else {
      onClose()
    }
  }

  if (!visible) return null

  const containerStyle = enhanced
    ? [
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
          opacity: opacityAnim,
        },
        shadows.xl,
      ]
    : styles.container

  return (
    <Modal visible={visible} transparent animationType={enhanced ? "none" : "fade"} onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Animated.View style={{ opacity: enhanced ? opacityAnim : 1 }}>
          <View style={styles.overlayBackground} />
        </Animated.View>
        <SafeAreaView style={styles.safeArea}>
          <Pressable onPress={() => {}}>
            <Animated.View style={containerStyle}>
              {title && (
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>

              {footer && <View style={styles.footer}>{footer}</View>}
            </Animated.View>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  safeArea: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16, // Add horizontal padding
    paddingVertical: 32, // Add vertical padding
  },
  container: {
    width: Platform.OS === "web" ? Math.min(width * 0.8, 500) : width * 0.92, // Slightly wider
    maxHeight: height * 0.85, // Increased max height
    minHeight: 400, // Ensure minimum height
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    // Add shadow for better visual depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.lightGray,
  },
  closeButtonText: {
    fontSize: fontSizes.md,
    color: colors.gray,
    fontWeight: "bold",
  },
  content: {
    maxHeight: height * 0.55, // Reduced content height to make room for footer
    flex: 1, // Allow content to grow
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl, // Extra bottom padding
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.background,
    gap: spacing.md, // Add spacing between footer elements
    minHeight: 80, // Ensure minimum footer height for buttons
  },
})
