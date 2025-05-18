"use client"

import type React from "react"
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import type { FilterState } from "../../types/feeds/feed"

interface FilterModalProps {
  visible: boolean
  onClose: () => void
  activeFilters: FilterState
  onTopicToggle: (topic: string) => void
  onTypeToggle: (type: string) => void
  onTagToggle: (tag: string) => void
  onUserToggle: (user: string) => void // Add this line
  onClearFilters: () => void
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  activeFilters,
  onTopicToggle,
  onTypeToggle,
  onTagToggle,
  onUserToggle,
  onClearFilters,
}) => {
  const { colors, isDark } = useTheme()

  const TOPIC_CHOICES = ["Technology", "Business", "Health", "Science", "Entertainment", "Sports"]
  const POST_TYPES = ["Text", "Image", "Video", "Poll"]
  const TAG_CHOICES = ["Trending", "Popular", "New", "Programming", "Design", "Marketing"]
  const USER_CHOICES = ["Jane Cooper", "Alex Morgan", "Taylor Swift", "Robert Johnson", "Emily Johnson", "David Wilson"] // Add this line

  const totalActiveFilters =
    activeFilters.topics.length + activeFilters.types.length + activeFilters.tags.length + activeFilters.users.length

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
            <Text style={[styles.title, { color: colors.text }]}>Filter</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <FilterSection
              title="Filter by Topic"
              items={TOPIC_CHOICES}
              selectedItems={activeFilters.topics}
              onToggle={onTopicToggle}
              colors={colors}
            />

            <FilterSection
              title="Filter by Type"
              items={POST_TYPES}
              selectedItems={activeFilters.types}
              onToggle={onTypeToggle}
              colors={colors}
            />

            <FilterSection
              title="Filter by Tag"
              items={TAG_CHOICES}
              selectedItems={activeFilters.tags}
              onToggle={onTagToggle}
              colors={colors}
            />
            <FilterSection
              title="Filter by Author"
              items={USER_CHOICES}
              selectedItems={activeFilters.users}
              onToggle={onUserToggle}
              colors={colors}
            />
          </ScrollView>

          <View style={styles.footer}>
            {totalActiveFilters > 0 && (
              <TouchableOpacity style={[styles.clearButton, { borderColor: colors.danger }]} onPress={onClearFilters}>
                <Text style={{ color: colors.danger }}>Clear all filters</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.applyButton, { backgroundColor: colors.primary }]} onPress={onClose}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
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
            <Text style={[styles.title, { color: colors.text }]}>Filter</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <FilterSection
              title="Filter by Topic"
              items={TOPIC_CHOICES}
              selectedItems={activeFilters.topics}
              onToggle={onTopicToggle}
              colors={colors}
            />

            <FilterSection
              title="Filter by Type"
              items={POST_TYPES}
              selectedItems={activeFilters.types}
              onToggle={onTypeToggle}
              colors={colors}
            />

            <FilterSection
              title="Filter by Tag"
              items={TAG_CHOICES}
              selectedItems={activeFilters.tags}
              onToggle={onTagToggle}
              colors={colors}
            />
            <FilterSection
              title="Filter by Author"
              items={USER_CHOICES}
              selectedItems={activeFilters.users}
              onToggle={onUserToggle}
              colors={colors}
            />
          </ScrollView>

          <View style={styles.footer}>
            {totalActiveFilters > 0 && (
              <TouchableOpacity style={[styles.clearButton, { borderColor: colors.danger }]} onPress={onClearFilters}>
                <Text style={{ color: colors.danger }}>Clear all filters</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.applyButton, { backgroundColor: colors.primary }]} onPress={onClose}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

interface FilterSectionProps {
  title: string
  items: string[]
  selectedItems: string[]
  onToggle: (item: string) => void
  colors: any
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, items, selectedItems, onToggle, colors }) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.itemsContainer}>
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterItem,
              {
                backgroundColor: selectedItems.includes(item) ? colors.primary : "transparent",
                borderColor: selectedItems.includes(item) ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onToggle(item)}
          >
            <Text
              style={[
                styles.filterItemText,
                {
                  color: selectedItems.includes(item) ? "white" : colors.text,
                },
              ]}
            >
              {item}
            </Text>
            {selectedItems.includes(item) && (
              <Ionicons name="checkmark" size={16} color="white" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "80%",
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
    maxWidth: 500,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: "80%",
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  filterItemText: {
    fontSize: 14,
  },
  checkIcon: {
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
})

export default FilterModal
