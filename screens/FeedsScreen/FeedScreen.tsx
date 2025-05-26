"use client"

import { useState, useRef } from "react"
import { StyleSheet, TouchableOpacity, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import FeedHeader from "../../components/FeedsScreen/FeedHeader"
import FeedContainer from "../../components/FeedsScreen/FeedContainer"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import { useToast } from "../../contexts/feeds/ToastContext"
import type { FilterState, SortOption } from "../../types/feeds"

const FeedScreen = () => {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const toast = useToast()
  const [filters, setFilters] = useState<FilterState>({
    topics: [],
    types: [],
    tags: [],
    users: [],
  })
  const [sortBy, setSortBy] = useState<SortOption>("most-viewed")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("for-you")
  const [isSearching, setIsSearching] = useState(false)
  
  const feedContainerRef = useRef<any>(null)
  const scaleAnim = useRef(new Animated.Value(1)).current
  
  const handleRefresh = () => {
    if (feedContainerRef.current) {
      feedContainerRef.current.refresh()
    }
  }

  const handleLoadingChange = (loading: boolean) => {
    setIsSearching(loading)
  }
  
  const handleAddPost = () => {
    // Enhanced animation for button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start(() => {
      try {
        // Navigate to CreatePost screen
        navigation.navigate("CreatePost");
        console.log("Navigating to create post screen");
      } catch (err) {
        console.error("Navigation error:", err);
        toast.toast({
          title: "Create Post",
          description: "This feature is coming soon!",
          type: "info",
          duration: 3000,
        });
      }
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FeedHeader
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
        onSearchChange={setSearchQuery}
        onTabChange={setActiveTab}
        onRefresh={handleRefresh}
        showFollowingTab={false}
        isSearching={isSearching}
      />
      
      <FeedContainer 
        ref={feedContainerRef}
        filters={filters} 
        sortBy={sortBy} 
        searchQuery={searchQuery} 
        activeTab={activeTab}
        onLoadingChange={handleLoadingChange}
      />
      
      {/* Enhanced FAB with better design */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary, ...styles.fabShadow }]}
        onPress={() => {
          console.log('Button pressed');
          handleAddPost();
        }}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  fabShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})

export default FeedScreen;
