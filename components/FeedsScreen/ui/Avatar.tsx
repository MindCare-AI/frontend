"use client"

import type React from "react"
import { View, Image, Text, StyleSheet } from "react-native"
import { useTheme } from "../../../contexts/feeds/ThemeContext"

interface AvatarProps {
  source?: string
  name?: string
  size?: "small" | "medium" | "large"
  style?: any
}

const Avatar: React.FC<AvatarProps> = ({ source, name = "", size = "medium", style }) => {
  const { colors, isDark } = useTheme()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          width: 32,
          height: 32,
          borderRadius: 16,
        }
      case "medium":
        return {
          width: 40,
          height: 40,
          borderRadius: 20,
        }
      case "large":
        return {
          width: 56,
          height: 56,
          borderRadius: 28,
        }
      default:
        return {
          width: 40,
          height: 40,
          borderRadius: 20,
        }
    }
  }

  const getFontSize = () => {
    switch (size) {
      case "small":
        return 12
      case "medium":
        return 14
      case "large":
        return 18
      default:
        return 14
    }
  }

  return (
    <View
      style={[
        getSizeStyle(),
        styles.container,
        { backgroundColor: isDark ? colors.highlight : colors.secondary },
        style,
      ]}
    >
      {source ? (
        <Image source={{ uri: source }} style={[getSizeStyle(), styles.image]} />
      ) : (
        <Text style={[styles.initials, { fontSize: getFontSize(), color: colors.text }]}>{getInitials(name)}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  initials: {
    fontWeight: "500",
  },
})

export default Avatar
