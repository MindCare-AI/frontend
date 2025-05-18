"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../../contexts/feeds/ThemeContext"

interface BadgeProps {
  text: string
  onRemove?: () => void
}

const Badge: React.FC<BadgeProps> = ({ text, onRemove }) => {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.highlight,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Ionicons name="close" size={14} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
  },
  removeButton: {
    marginLeft: 4,
  },
})

export default Badge
