"use client"

import React from "react"
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { useMessagesStore } from "../../store/messagesStore"
import type { NewConversationScreenNavigationProp } from "../../navigation/types"
import { Avatar } from "../../components/MessagingScreen/ui/Avatar"
import { ErrorBoundary } from "../../components/MessagingScreen/ErrorBoundary"
import { NetworkStatusBar } from "../../components/MessagingScreen/NetworkStatusBar"
import { TextInput } from "react-native"

const NewConversationScreen: React.FC = () => {
  const navigation = useNavigation<NewConversationScreenNavigationProp>()
  const { contacts } = useMessagesStore()
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSelectContact = (contactId: string) => {
    // In a real app, you would create a new conversation here
    // For now, we'll just navigate to an existing conversation
    navigation.navigate("Chat", { id: contactId })
  }

  const renderContactItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={styles.contactItem} onPress={() => handleSelectContact(item.id)}>
        <Avatar source={item.avatar} name={item.name} size={50} online={item.isOnline} />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.type && <Text style={styles.contactType}>{item.type}</Text>}
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
          <Text style={styles.title}>New Conversation</Text>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("NewGroup")}>
            <Feather name="users" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contactList}
        />
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
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  iconButton: {
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
  contactList: {
    padding: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  contactInfo: {
    marginLeft: 16,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
  },
  contactType: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
})

export default NewConversationScreen
