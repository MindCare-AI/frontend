"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, TextInput } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { useMessagesStore } from "../../store/messagesStore"
import type { SearchScreenRouteProp, SearchScreenNavigationProp } from "../../navigation/types"
import { Avatar } from "../../components/MessagingScreen/ui/Avatar"
import { ErrorBoundary } from "../../components/MessagingScreen/ErrorBoundary"
import { NetworkStatusBar } from "../../components/MessagingScreen/NetworkStatusBar"

const SearchScreen: React.FC = () => {
  const route = useRoute<SearchScreenRouteProp>()
  const navigation = useNavigation<SearchScreenNavigationProp>()
  const conversationId = route.params?.conversationId

  const { searchMessages } = useMessagesStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        const results = searchMessages(searchQuery, conversationId)
        setSearchResults(results)
        setIsSearching(false)
      }, 500)

      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, conversationId])

  const handleSelectResult = (result: any) => {
    navigation.navigate("Chat", {
      id: result.conversationId,
      highlightMessageId: result.messageId,
    })
  }

  const renderResultItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectResult(item)}>
        <Avatar source={item.conversationAvatar} name={item.conversationName} size={40} />
        <View style={styles.resultContent}>
          <View style={styles.resultHeader}>
            <Text style={styles.conversationName}>{item.conversationName}</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.senderName}>{item.senderName}</Text>
          <Text style={styles.messageContent} numberOfLines={2}>
            {item.content}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <NetworkStatusBar />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search messages..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <Text>Searching...</Text>
            </View>
          ) : searchQuery.length > 0 && searchResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="search" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderResultItem}
              keyExtractor={(item) => item.messageId}
              contentContainerStyle={styles.resultsList}
            />
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 16,
    textAlign: "center",
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    color: "#64748B",
  },
  senderName: {
    fontSize: 14,
    color: "#3B82F6",
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    color: "#334155",
  },
})

export default SearchScreen
