"use client"

import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import CreatePostButton from "./CreatePostButton"

const EmptyFeed: React.FC = () => {
  // Use HomeSettingsScreen color scheme
  const homeScreenColors = {
    primary: '#002D62',
    lightBlue: '#E4F0F6',
    white: '#FFFFFF',
    textDark: '#333',
    textMedium: '#444',
    borderColor: '#F0F0F0',
    background: '#FFFFFF',
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: homeScreenColors.lightBlue,
          },
        ]}
      >
        <Ionicons name="chatbubble-ellipses" size={40} color={homeScreenColors.primary} />
      </View>
      <Text style={[styles.title, { color: homeScreenColors.textDark }]}>No posts yet</Text>
      <Text style={[styles.description, { color: homeScreenColors.textMedium }]}>
        Be the first to create a post or follow other users to see their posts in your feed.
      </Text>
      <View style={styles.actions}>
        <CreatePostButton position="center" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  actions: {
    alignItems: "center",
  },
})

export default EmptyFeed
