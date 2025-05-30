"use client"

import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import CreatePostButton from "./CreatePostButton"
import { useTheme } from "../../contexts/feeds/ThemeContext"

interface EmptyFeedProps {
  message?: string;
}

const EmptyFeed: React.FC<EmptyFeedProps> = ({ message }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.highlight,
          },
        ]}
      >
        <Ionicons name="chatbubble-ellipses" size={40} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>No posts yet</Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        {message || 'Be the first to create a post or follow other users to see their posts in your feed.'}
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
