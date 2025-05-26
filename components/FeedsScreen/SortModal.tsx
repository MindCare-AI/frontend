"use client"

import type React from "react"
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"

interface SortOption {
  value: string
  label: string
}

interface SortModalProps {
  visible: boolean
  onClose: () => void
  activeSort: string
  onSortChange: (sort: string) => void
  sortOptions: SortOption[]
}

const SortModal: React.FC<SortModalProps> = ({ visible, onClose, activeSort, onSortChange, sortOptions }) => {
  const { colors } = useTheme()

  const handleSelect = (value: string) => {
    onSortChange(value)
    onClose()
  }

  if (Platform.OS === "web") {
    // For web, render a different UI since Modal doesn't work well on web
    if (!visible) return null

    return (
      <View
        style={[
          styles.webOverlay,
          {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        ]}
      >
        <View
          style={[
            styles.webModalContent,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Sort by</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  {
                    backgroundColor: activeSort === option.value ? colors.highlight : "transparent",
                  },
                ]}
                onPress={() => handleSelect(option.value)}
              >
                <Text style={[styles.sortOptionText, { color: colors.text }]}>{option.label}</Text>
                {activeSort === option.value && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose} statusBarTranslucent>
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
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Sort by</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  {
                    backgroundColor: activeSort === option.value ? colors.highlight : "transparent",
                  },
                ]}
                onPress={() => handleSelect(option.value)}
              >
                <Text style={[styles.sortOptionText, { color: colors.text }]}>{option.label}</Text>
                {activeSort === option.value && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000, // Add high z-index
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  webOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  webModalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionText: {
    fontSize: 16,
  },
})

export default SortModal
