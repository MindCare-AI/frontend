"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"

interface ErrorFeedProps {
  error: string
  onRetry: () => void
}

const ErrorFeed: React.FC<ErrorFeedProps> = ({ error, onRetry }) => {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.danger + "20",
          },
        ]}
      >
        <Ionicons name="alert-circle" size={40} color={colors.danger} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Something went wrong</Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        {error || "We couldn't load your feed. Please try again later."}
      </Text>
      <TouchableOpacity
        style={[
          styles.retryButton,
          {
            backgroundColor: colors.primary,
          },
        ]}
        onPress={onRetry}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
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
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default ErrorFeed
