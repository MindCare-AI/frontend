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
} from "react-native"
import { colors, spacing, borderRadius, fontSizes } from "./theme"
import { SafeAreaView } from "react-native-safe-area-context"

interface DialogProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

const { width, height } = Dimensions.get("window")

export function Dialog({ visible, onClose, title, children, footer }: DialogProps) {
  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose}>
        <View style={styles.overlay}>
          <Pressable onPress={() => {}}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.container}>
                {title && (
                  <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
              </View>
            </SafeAreaView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: Platform.OS === "web" ? Math.min(width * 0.8, 500) : width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.black,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: fontSizes.lg,
    color: colors.gray,
  },
  content: {
    maxHeight: height * 0.6,
  },
  contentContainer: {
    padding: spacing.md,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
})
