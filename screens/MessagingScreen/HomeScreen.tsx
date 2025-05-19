"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { ConversationList } from "../../components/MessagingScreen/conversations/ConversationList"
import { useMessagesStore } from "../../store/messagesStore"
import type { HomeScreenNavigationProp } from "../../navigation/types"
import { Avatar } from "../../components/MessagingScreen/ui/Avatar"
import { NetworkStatusBar } from "../../components/MessagingScreen/NetworkStatusBar"
import { PullToRefresh } from "../../components/MessagingScreen/PullToRefresh"
import { ErrorBoundary } from "../../components/MessagingScreen/ErrorBoundary"

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const { conversations, initializeStore, deleteConversation, isLoading } = useMessagesStore()
  const [activeTab, setActiveTab] = useState<"all" | "direct" | "groups">("all")

  useEffect(() => {
    initializeStore()
  }, [])

  const filteredConversations = conversations.filter((conversation) => {
    if (activeTab === "all") return true
    if (activeTab === "direct") return !conversation.isGroup
    if (activeTab === "groups") return conversation.isGroup
    return true
  })

  const handleSelectConversation = (conversationId: string) => {
    navigation.navigate("Chat", { id: conversationId })
  }

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation(conversationId)
  }

  const handleViewProfile = (userId: string) => {
    navigation.navigate("Profile", { id: userId })
  }

  const handleViewMembers = (conversationId: string) => {
    navigation.navigate("GroupMembers", { id: conversationId })
  }

  const handleRefresh = async () => {
    await initializeStore()
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <NetworkStatusBar />
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Search", { conversationId: undefined })}>
              <Feather name="search" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("NewConversation")}>
              <Feather name="plus" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Settings")}>
              <Feather name="settings" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Profile", { id: "current-user" })}>
              <Avatar name="You" source="https://ui-avatars.com/api/?name=You" size={32} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => setActiveTab("all")}
          >
            <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "direct" && styles.activeTab]}
            onPress={() => setActiveTab("direct")}
          >
            <Text style={[styles.tabText, activeTab === "direct" && styles.activeTabText]}>Direct</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "groups" && styles.activeTab]}
            onPress={() => setActiveTab("groups")}
          >
            <Text style={[styles.tabText, activeTab === "groups" && styles.activeTabText]}>Groups</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <PullToRefresh onRefresh={handleRefresh}>
            <ConversationList
              conversations={filteredConversations}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onViewProfile={handleViewProfile}
              onViewMembers={handleViewMembers}
            />
          </PullToRefresh>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "white",
    borderBottomWidth: 2,
    borderBottomColor: "#3B82F6",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#3B82F6",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
})

export default HomeScreen
