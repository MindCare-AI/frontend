"use client"

import type React from "react"
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, ScrollView, Image } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { Avatar } from "../../components/MessagingScreen/ui/Avatar"
import { Button } from "../../components/MessagingScreen/ui/Button"
import { useMessagesStore } from "../../store/messagesStore"
import type { ProfileScreenRouteProp, ProfileScreenNavigationProp } from "../../navigation/types"
import { ErrorBoundary } from "../../components/MessagingScreen/ErrorBoundary"
import { NetworkStatusBar } from "../../components/MessagingScreen/NetworkStatusBar"

const ProfileScreen: React.FC = () => {
  const route = useRoute<ProfileScreenRouteProp>()
  const navigation = useNavigation<ProfileScreenNavigationProp>()
  const { id } = route.params

  const { contacts, currentUser } = useMessagesStore()
  const user = id === "current-user" ? currentUser : contacts.find((c) => c.id === id) || currentUser

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <NetworkStatusBar />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="more-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.profileHeader}>
            <Avatar source={user.avatar} name={user.name} size={100} online={user.isOnline} />
            <Text style={styles.profileName}>{user.name}</Text>
            {user.type && <Text style={styles.profileType}>{user.type}</Text>}
            {user.isOnline ? (
              <Text style={styles.onlineStatus}>Online</Text>
            ) : (
              <Text style={styles.offlineStatus}>Last active: {user.lastActive || "Unknown"}</Text>
            )}

            <View style={styles.actionButtons}>
              <Button
                title="Message"
                icon={<Feather name="message-square" size={18} color="white" />}
                onPress={() => navigation.navigate("Chat", { id: user.id })}
              />
              <Button
                title="Block"
                variant="outline"
                onPress={() => {
                  // Handle block
                }}
                style={{ marginLeft: 12 }}
              />
            </View>
          </View>

          {user.email && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <Text style={styles.sectionText}>Email: {user.email}</Text>
            </View>
          )}

          {user.specialization && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specialization</Text>
              <Text style={styles.sectionText}>{user.specialization}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shared Media</Text>
            <View style={styles.mediaGrid}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.mediaItem}>
                  <Image
                    source={{ uri: `https://picsum.photos/200/200?random=${i}` }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("MediaGallery", { id: user.id })}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  profileType: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  onlineStatus: {
    fontSize: 14,
    color: "#10B981",
    marginTop: 8,
  },
  offlineStatus: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 24,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: "#333",
  },
  mediaGrid: {
    flexDirection: "row",
    marginBottom: 12,
  },
  mediaItem: {
    width: "33%",
    aspectRatio: 1,
    padding: 2,
  },
  mediaImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  seeAllText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
})

export default ProfileScreen
