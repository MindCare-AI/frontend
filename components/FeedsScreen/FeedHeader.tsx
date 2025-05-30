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
  isSearching?: boolean
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ 
  onFiltersChange, 
  onSortChange, 
  onSearchChange, 
  onTabChange, 
  onRefresh,
  showFollowingTab = true,
  isSearching: externalIsSearching = false
}) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('for-you');
  const [isSearching, setIsSearching] = useState<boolean>(externalIsSearching);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [currentSort, setCurrentSort] = useState<SortOption>('newest');
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    topics: [],
    types: [],
    tags: [],
    users: []
  });

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  // Handle search toggle
  const toggleSearch = () => {
    if (isSearching && searchQuery) {
      setSearchQuery('');
      onSearchChange('');
    }
    setIsSearching(!isSearching);
  };

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearchChange(query);
  };

  // Handle sort change
  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
    onSortChange(sort);
  };

  // Handle filters change
  const handleFiltersChange = (filters: FilterState) => {
    setSelectedFilters(filters);
    onFiltersChange(filters);
    setIsFiltersOpen(false);
  };

  // Handle filters toggle
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      {!isSearching && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'for-you' && [styles.activeTab, { borderColor: colors.primary }]
            ]}
            onPress={() => handleTabChange('for-you')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'for-you' && [styles.activeTabText, { color: colors.primary }]
              ]}
            >
              For You
            </Text>
          </TouchableOpacity>
          
          {showFollowingTab && (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'following' && [styles.activeTab, { borderColor: colors.primary }]
              ]}
              onPress={() => handleTabChange('following')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'following' && [styles.activeTabText, { color: colors.primary }]
                ]}
              >
                Following
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'trending' && [styles.activeTab, { borderColor: colors.primary }]
            ]}
            onPress={() => handleTabChange('trending')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'trending' && [styles.activeTabText, { color: colors.primary }]
              ]}
            >
              Trending
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search and filter bar */}
      <View style={styles.actionsContainer}>
        {isSearching ? (
          <View style={[styles.searchContainer, { backgroundColor: colors.highlight }]}>
            <Ionicons name="search" size={20} color={colors.muted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search posts..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
            <TouchableOpacity onPress={toggleSearch}>
              <Ionicons name="close" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.highlight }]}
              onPress={toggleSearch}
            >
              <Ionicons name="search" size={20} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.highlight }]}
              onPress={toggleFilters}
            >
              <Ionicons 
                name="options" 
                size={20} 
                color={
                  selectedFilters.types.length > 0 || selectedFilters.topics.length > 0 || selectedFilters.tags.length > 0
                    ? colors.primary
                    : colors.text
                } 
              />
            </TouchableOpacity>
            
            <View style={styles.sortContainer}>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  currentSort === 'newest' && { backgroundColor: colors.highlight }
                ]}
                onPress={() => handleSortChange('newest')}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    currentSort === 'newest' && { color: colors.primary, fontWeight: '600' }
                  ]}
                >
                  Latest
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  currentSort === 'most-reactions' && { backgroundColor: colors.highlight }
                ]}
                onPress={() => handleSortChange('most-reactions')}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    currentSort === 'most-reactions' && { color: colors.primary, fontWeight: '600' }
                  ]}
                >
                  Popular
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.highlight }]}
              onPress={onRefresh}
            >
              <Ionicons name="refresh" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filters modal */}
      {isFiltersOpen && (
        <FilterModal
          visible={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          activeFilters={selectedFilters}
          onTopicToggle={() => {}}
          onTypeToggle={() => {}}
          onTagToggle={() => {}}
          onUserToggle={() => {}}
          onClearFilters={() => {}}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  sortButtonText: {
    fontSize: 14,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 20,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    height: 40,
    fontSize: 16,
  },
});

export default FeedHeader;
