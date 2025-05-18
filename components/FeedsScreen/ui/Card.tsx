"use client"

import type React from "react"
import { View, StyleSheet, Platform } from "react-native"
import { useTheme } from "../../../contexts/feeds/ThemeContext"

interface CardProps {
  children: React.ReactNode
  style?: any
}

const Card: React.FC<CardProps> = ({ children, style }) => {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 3,
            },
            web: {
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            },
          }),
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
})

export default Card
