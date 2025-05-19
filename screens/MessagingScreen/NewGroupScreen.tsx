"use client"

import type React from "react"
import { useState } from "react"
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, TextInput } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { useMessagesStore } from "../../store/messagesStore"
import type { NewGroupScreenNavigationProp } from "../../navigation/types"
import { Avatar } from "../../components/MessagingScreen/ui/Avatar"
import { Button } from "../../components/MessagingScreen/ui/Button"
import { ErrorBoundary } from "../../components/MessagingScreen/ErrorBoundary"
import { NetworkStatusBar } from "../../components/MessagingScreen/NetworkStatusBar"

const NewGroupScreen: React.FC = () => {
  const navigation = useNavigation<NewGroupScreenNavigationProp>()
  const { contacts } = useMessagesStore()

  const [groupName, setGroupName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleContactSelection = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId))
    } else {
      setSelectedContacts([...selectedContacts, contactId])
    }
  }

  const handleCreateGroup = () => {
    // In a real app, you would create a new group conversation here
    // For now, we'll just navigate back to the home screen
    navigation.navigate("Home")
  }

  const renderContactItem = ({ item }: { item: any }) => {
    const isSelected = selectedContacts.includes(item.id)

    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.selectedContactItem]}
        onPress={() => toggleContactSelection(item.id)}
      >
        <Avatar source={item.avatar} name={item.name} size={50} />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.type && <Text style={styles.contactType}>{item.type}</Text>}
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Feather name="check" size={20} color="white" />
          </View>
        )}
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
          <Text style={styles.title}>New Group</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.groupNameContainer}>
          <TextInput
            style={styles.groupNameInput}
            placeholder="Group name"
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>

        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedContacts.length} of {contacts.length} contacts selected
          </Text>
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

        <View style={styles.footer}>
          <Button
            title="Create Group"
            disabled={selectedContacts.length < 2 || !groupName.trim()}
            onPress={handleCreateGroup}
          />
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
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  groupNameContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  groupNameInput: {
    fontSize: 18,
    fontWeight: "500",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  selectedCount: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  selectedCountText: {
    fontSize: 14,
    color: "#666",
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
    position: "relative",
  },
  selectedContactItem: {
    backgroundColor: "#F0F9FF",
  },
  contactInfo: {
    marginLeft: 16,
    flex: 1,
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
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
})

export default NewGroupScreen
