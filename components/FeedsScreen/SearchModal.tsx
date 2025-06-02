"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Animated, Dimensions, Keyboard, Easing } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"
import LoadingSpinner from "../../components/LoadingSpinner"

interface SearchModalProps {
  visible: boolean
  onClose: () => void
  onSearch: (query: string) => void
  isSearching?: boolean
  searchResults?: any[]
}

const SearchModal: React.FC<SearchModalProps> = ({ 
  visible, 
  onClose, 
  onSearch, 
  isSearching = false,
  searchResults = []
}) => {
  const { colors, isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [recentSearches] = useState(["React Native", "TypeScript", "Expo", "Mobile Development"])
  const inputRef = useRef<TextInput>(null)
  
  // Enhanced animation refs
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.92)).current
  const inputScaleAnim = useRef(new Animated.Value(0.98)).current
  const inputFocusBorderAnim = useRef(new Animated.Value(0)).current
  const shadowAnim = useRef(new Animated.Value(0)).current
  const placeholderAnim = useRef(new Animated.Value(0)).current
  
  // Focus input and animate when modal opens
  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus()
        
        // Input focus animation
        Animated.timing(inputFocusBorderAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start()
        
        // Input scale animation
        Animated.spring(inputScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start()
        
        // Placeholder animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(placeholderAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(placeholderAnim, {
              toValue: 0,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ])
        ).start()
      }, 300)
      
      return () => clearTimeout(timeout)
    } else {
      inputFocusBorderAnim.setValue(0)
      inputScaleAnim.setValue(0.98)
    }
  }, [visible])
  
  useEffect(() => {
    if (visible) {
      // Enhanced entrance animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 55,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        })
      ]).start()
    } else {
      // Reset animations when modal closes
      Keyboard.dismiss()
      slideAnim.setValue(0)
      fadeAnim.setValue(0)
      scaleAnim.setValue(0.92)
      shadowAnim.setValue(0)
    }
  }, [visible])

  const handleClose = () => {
    // Enhanced exit animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      })
    ]).start(() => {
      onClose()
      // Reset search query when modal closes
      setSearchQuery("")
    })
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery)
    }
  }

  const handleSelectRecent = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }

  // Calculate interpolated values for animations
  const shadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15]
  })
  
  const inputBorderColor = inputFocusBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary]
  })
  
  // Placeholder subtle animation
  const placeholderOpacity = placeholderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.8]
  })

  if (Platform.OS === "web") {
    // For web, render a different UI since Modal doesn't work well on web
    if (!visible) return null

    return (
      <Animated.View
        style={[
          styles.webOverlay,
          {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.webModalContent,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })}
              ],
              shadowOpacity: shadowOpacity,
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 12,
            },
          ]}
        >
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.searchInputContainer,
                {
                  backgroundColor: isDark ? colors.highlight : "#F8F9FA",
                  borderColor: inputBorderColor,
                  borderWidth: 2,
                  transform: [{ scale: inputScaleAnim }]
                },
              ]}
            >
              <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
              <TextInput
                ref={inputRef}
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search"
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={colors.muted} />
                </TouchableOpacity>
              )}
            </Animated.View>
            <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: colors.highlight }]}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <LoadingSpinner visible={true} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>
                  Searching...
                </Text>
              </View>
            ) : searchQuery.length > 0 && searchResults.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={48} color={colors.muted} />
                <Text style={[styles.noResultsText, { color: colors.muted }]}>
                  No results found for "{searchQuery}"
                </Text>
                <Text style={[styles.noResultsSubtext, { color: colors.muted }]}>
                  Try adjusting your search terms
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Searches</Text>
                {recentSearches.map((query, index) => (
                  <TouchableOpacity key={index} style={styles.recentItem} onPress={() => handleSelectRecent(query)}>
                    <Ionicons name="time-outline" size={20} color={colors.muted} style={styles.recentIcon} />
                    <Text style={[styles.recentText, { color: colors.text }]}>{query}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <Animated.View 
        style={[
          styles.container, 
          { 
            backgroundColor: colors.background,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.searchInputContainer,
              {
                backgroundColor: isDark ? colors.highlight : "#F0F0F0",
                borderColor: inputBorderColor,
                borderWidth: 2,
                transform: [{ scale: inputScaleAnim }]
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search"
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={colors.muted} />
              </TouchableOpacity>
            )}
          </Animated.View>
          <TouchableOpacity 
            onPress={handleClose} 
            style={[styles.closeButton, { backgroundColor: colors.highlight }]}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}
        >
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner visible={true} />
              <Text style={[styles.loadingText, { color: colors.muted }]}>
                Searching...
              </Text>
            </View>
          ) : searchQuery.length > 0 && searchResults.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color={colors.muted} />
              <Text style={[styles.noResultsText, { color: colors.muted }]}>
                No results found for "{searchQuery}"
              </Text>
              <Text style={[styles.noResultsSubtext, { color: colors.muted }]}>
                Try adjusting your search terms
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Searches</Text>
              {recentSearches.map((query, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.recentItem, { borderBottomColor: colors.border }]} 
                  onPress={() => handleSelectRecent(query)}
                >
                  <Ionicons name="time-outline" size={20} color={colors.muted} style={styles.recentIcon} />
                  <Text style={[styles.recentText, { color: colors.text }]}>{query}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </Animated.View>
      </Animated.View>
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
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 80,
    maxHeight: "80%",
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    height: 48,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontWeight: '500',
    paddingRight: 8,
  },
  clearButton: {
    padding: 6,
    marginRight: 8,
  },
  closeButton: {
    marginLeft: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 112, 243, 0.1)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    marginBottom: 4,
  },
  recentIcon: {
    marginRight: 12,
    opacity: 0.7,
  },
  recentText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  noResultsSubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
})

export default SearchModal
