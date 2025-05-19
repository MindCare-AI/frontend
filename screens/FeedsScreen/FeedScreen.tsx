"use client"

import { useState, useRef } from "react"
import { StyleSheet, TouchableOpacity, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import FeedHeader from "../../components/FeedsScreen/FeedHeader"
import FeedContainer from "../../components/FeedsScreen/FeedContainer"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import { useToast } from "../../contexts/feeds/ToastContext" // Import toast context
import type { FilterState, SortOption } from "../../types/feeds"

const FeedScreen = () => {
  const { colors } = useTheme()
  const navigation = useNavigation<any>() // Use any type to bypass type checking temporarily
  const toast = useToast() // Get the toast function
  const [filters, setFilters] = useState<FilterState>({
    topics: [],
    types: [],
    tags: [],
    users: [],
  })
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("for-you") // Only using for-you since we're removing the following tab
  
  // Reference to the FeedContainer to access its refresh method
  const feedContainerRef = useRef<any>(null)
  
  // Animation value for the add button
  const scaleAnim = useRef(new Animated.Value(1)).current
  
  // Handler for refresh button click
  const handleRefresh = () => {
    if (feedContainerRef.current) {
      feedContainerRef.current.refresh()
    }
  }
  
  // Handler for add button press - navigate to create post screen
  const handleAddPost = () => {
    // Animation for button press
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
        // Try to navigate to the CreatePostScreen
        navigation.navigate("CreatePost");
        console.log("Navigating to create post screen");
      } catch (err) {
        console.error("Navigation error:", err);
        // Show toast message as fallback
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
        showFollowingTab={false} // Add this prop to control visibility of following tab
      />
      
      <FeedContainer 
        ref={feedContainerRef}
        filters={filters} 
        sortBy={sortBy} 
        searchQuery={searchQuery} 
        activeTab={activeTab} 
      />
      
      {/* Add Post Button (FAB) */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddPost}
          activeOpacity={0.8}
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
})

export default FeedScreen
