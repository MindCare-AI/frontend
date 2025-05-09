"use client"

import type { ReactNode } from "react"
import { View, StyleSheet, type ViewStyle, Platform } from "react-native"
import { useTheme } from "../../../contexts/ThemeContext"

interface CardProps {
  children: ReactNode
  style?: ViewStyle
}

export default function Card({ children, style }: CardProps) {
  const { colors } = useTheme()

  return <View style={[styles.card, { backgroundColor: colors.card }, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
})
