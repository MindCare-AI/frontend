"use client"

import type React from "react"
import { useState } from "react"
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"

interface SearchModalProps {
  visible: boolean
  onClose: () => void
  onSearch: (query: string) => void
}

const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose, onSearch }) => {
  const { colors, isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [recentSearches] = useState(["React Native", "TypeScript", "Expo", "Mobile Development"])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery)
    }
  }

  const handleSelectRecent = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
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
            <View
              style={[
                styles.searchInputContainer,
                {
                  backgroundColor: isDark ? colors.highlight : "#F0F0F0",
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search posts, tags, or users..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                onSubmitEditing={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={{ color: colors.primary }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Searches</Text>
            {recentSearches.map((query, index) => (
              <TouchableOpacity key={index} style={styles.recentItem} onPress={() => handleSelectRecent(query)}>
                <Ionicons name="time-outline" size={20} color={colors.muted} style={styles.recentIcon} />
                <Text style={[styles.recentText, { color: colors.text }]}>{query}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View
            style={[
              styles.searchInputContainer,
              {
                backgroundColor: isDark ? colors.highlight : "#F0F0F0",
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search posts, tags, or users..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ color: colors.primary }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Searches</Text>
          {recentSearches.map((query, index) => (
            <TouchableOpacity key={index} style={styles.recentItem} onPress={() => handleSelectRecent(query)}>
              <Ionicons name="time-outline" size={20} color={colors.muted} style={styles.recentIcon} />
              <Text style={[styles.recentText, { color: colors.text }]}>{query}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  webOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1000,
  },
  webModalContent: {
    width: "100%",
    maxWidth: 600,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 80,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
  },
  searchIcon: {
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  closeButton: {
    marginLeft: 16,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  recentIcon: {
    marginRight: 12,
  },
  recentText: {
    fontSize: 16,
  },
})

export default SearchModal
