"use client"

import { useState } from "react"
import { StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import FeedHeader from "../../components/FeedsScreen/FeedHeader"
import FeedContainer from "../../components/FeedsScreen/FeedContainer"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import type { FilterState } from "../../types/feeds/feed"

const FeedScreen = () => {
  const { colors } = useTheme()
  const [filters, setFilters] = useState<FilterState>({
    topics: [],
    types: [],
    tags: [],
    users: [], // Add this line
  })
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("for-you")

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FeedHeader
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
        onSearchChange={setSearchQuery}
        onTabChange={setActiveTab}
      />
      <FeedContainer filters={filters} sortBy={sortBy} searchQuery={searchQuery} activeTab={activeTab} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default FeedScreen
