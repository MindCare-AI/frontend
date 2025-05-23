"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import type { FilterState, SortOption } from "../../types/feeds"
import FilterModal from "./FilterModal"
import SortModal from "./SortModal"
import SearchModal from "./SearchModal"
import Badge from "./ui/Badge"
import TabBar from "./ui/TabBar"

interface FeedHeaderProps {
  onFiltersChange: (filters: FilterState) => void
  onSortChange: (sort: SortOption) => void
  onSearchChange: (query: string) => void
  onTabChange: (tab: string) => void
  onRefresh: () => void
  showFollowingTab?: boolean // Add this prop
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ 
  onFiltersChange, 
  onSortChange, 
  onSearchChange, 
  onTabChange, 
  onRefresh,
  showFollowingTab = true // Default to showing it
}) => {
  const { colors, isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    topics: [],
    types: [],
    tags: [],
    users: [],
  })
  const [activeSort, setActiveSort] = useState<SortOption>("newest") // Added SortOption type here
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [sortModalVisible, setSortModalVisible] = useState(false)
  const [searchModalVisible, setSearchModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("for-you")

  const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "most-viewed", label: "Most Viewed" },
    { value: "most-reactions", label: "Most Reactions" },
  ]

  // Propagate changes to parent component
  useEffect(() => {
    onFiltersChange(activeFilters)
  }, [activeFilters, onFiltersChange])

  useEffect(() => {
    onSortChange(activeSort as SortOption) // Ensure the type is correct
  }, [activeSort, onSortChange])

  useEffect(() => {
    onSearchChange(searchQuery)
  }, [searchQuery, onSearchChange])

  useEffect(() => {
    onTabChange(activeTab)
  }, [activeTab, onTabChange])

  const handleTopicToggle = (topic: string) => {
    setActiveFilters((prev: FilterState) => ({
      ...prev,
      topics: prev.topics.includes(topic) ? prev.topics.filter((t: string) => t !== topic) : [...prev.topics, topic],
    }))
  }

  const handleTypeToggle = (type: string) => {
    setActiveFilters((prev: FilterState) => ({
      ...prev,
      types: prev.types.includes(type) ? prev.types.filter((t: string) => t !== type) : [...prev.types, type],
    }))
  }

  const handleTagToggle = (tag: string) => {
    setActiveFilters((prev: FilterState) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t: string) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const handleUserToggle = (user: string) => {
    setActiveFilters((prev: FilterState) => ({
      ...prev,
      users: prev.users.includes(user) ? prev.users.filter((u: string) => u !== user) : [...prev.users, user],
    }))
  }

  const clearFilters = () => {
    setActiveFilters({
      topics: [],
      types: [],
      tags: [],
      users: [],
    })
  }

  const totalActiveFilters =
    activeFilters.topics.length + activeFilters.types.length + activeFilters.tags.length + activeFilters.users.length

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSearchModalVisible(false)
  }

  // Add this handler function to handle sort changes from SortModal
  const handleSortChange = (sort: string) => {
    // Ensure the string is a valid SortOption
    if (sort === "newest" || sort === "most-viewed" || sort === "most-reactions") {
      setActiveSort(sort as SortOption)
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.searchContainer}>
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
            onFocus={() => setSearchModalVisible(true)}
          />
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? colors.highlight : "#F0F0F0",
                borderColor: colors.border,
              },
            ]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={16} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Filter</Text>
            {totalActiveFilters > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{totalActiveFilters}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? colors.highlight : "#F0F0F0",
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSortModalVisible(true)}
          >
            <Ionicons name="options" size={16} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {SORT_OPTIONS.find((option) => option.value === activeSort)?.label || "Sort"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active filters display */}
      {totalActiveFilters > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScrollView}
          contentContainerStyle={styles.filtersContainer}
        >
          {activeFilters.topics.map((topic: string) => (
            <Badge key={`topic-${topic}`} text={`Topic: ${topic}`} onRemove={() => handleTopicToggle(topic)} />
          ))}
          {activeFilters.types.map((type: string) => (
            <Badge key={`type-${type}`} text={`Type: ${type}`} onRemove={() => handleTypeToggle(type)} />
          ))}
          {activeFilters.tags.map((tag: string) => (
            <Badge key={`tag-${tag}`} text={`Tag: ${tag}`} onRemove={() => handleTagToggle(tag)} />
          ))}
          {activeFilters.users.map((user: string) => (
            <Badge key={`user-${user}`} text={`Author: ${user}`} onRemove={() => handleUserToggle(user)} />
          ))}
        </ScrollView>
      )}

      {/* Feed tabs */}
      <View style={styles.headerRow}>
        <TabBar
          tabs={[
            { key: "for-you", title: "For You" },
            ...(showFollowingTab ? [{ key: "following", title: "Following" }] : [])
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        activeFilters={activeFilters}
        onTopicToggle={handleTopicToggle}
        onTypeToggle={handleTypeToggle}
        onTagToggle={handleTagToggle}
        onUserToggle={handleUserToggle}
        onClearFilters={clearFilters}
      />

      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        activeSort={activeSort}
        onSortChange={handleSortChange} // Use handleSortChange instead of setActiveSort
        sortOptions={SORT_OPTIONS}
      />

      <SearchModal visible={searchModalVisible} onClose={() => setSearchModalVisible(false)} onSearch={handleSearch} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "web" ? 16 : 0,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  filtersScrollView: {
    maxHeight: 40,
  },
  filtersContainer: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
})

export default FeedHeader
