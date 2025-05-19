"use client"

import type React from "react"
import { useState } from "react"
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { useMessagesStore } from "../../store/messagesStore"
import type { GroupMembersScreenRouteProp, GroupMembersScreenNavigationProp } from "../../navigation/types"
import { Avatar } from "../../components/MessagingScreen/ui/Avatar"
import { ErrorBoundary } from "../../components/MessagingScreen/ErrorBoundary"
import { NetworkStatusBar } from "../../components/MessagingScreen/NetworkStatusBar"

const GroupMembersScreen: React.FC = () => {
  const route = useRoute<GroupMembersScreenRouteProp>()
  const navigation = useNavigation<GroupMembersScreenNavigationProp>()
  const { id: conversationId } = route.params

  const { conversations } = useMessagesStore()
  const conversation = conversations.find((c) => c.id === conversationId)
  const members = conversation?.participants || []
  const moderators = conversation?.moderators || []

  const [searchQuery, setSearchQuery] = useState("")

  const filteredMembers = members.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleViewProfile = (memberId: string) => {
    navigation.navigate("Profile", { id: memberId })
  }

  const renderMemberItem = ({ item }: { item: any }) => {
    const isModerator = moderators.includes(item.id)

    return (
      <TouchableOpacity style={styles.memberItem} onPress={() => handleViewProfile(item.id)}>
        <Avatar source={item.avatar} name={item.name} size={50} online={item.isOnline} />
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          {isModerator && <Text style={styles.moderatorBadge}>Moderator</Text>}
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Feather name="more-vertical" size={20} color="#64748B" />
        </TouchableOpacity>
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
          <Text style={styles.title}>Group Members</Text>
          <TouchableOpacity style={styles.addButton}>
            <Feather name="user-plus" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredMembers}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.memberList}
          ListHeaderComponent={
            <View style={styles.membersHeader}>
              <Text style={styles.membersCount}>{members.length} Members</Text>
            </View>
          }
        />
      </SafeAreaView>
    </ErrorBoundary>
  )
}

import { TextInput } from "react-native"

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
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  membersHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  membersCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  memberList: {
    padding: 16,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
  },
  moderatorBadge: {
    fontSize: 14,
    color: "#3B82F6",
    marginTop: 4,
  },
  moreButton: {
    padding: 4,
  },
})

export default GroupMembersScreen
