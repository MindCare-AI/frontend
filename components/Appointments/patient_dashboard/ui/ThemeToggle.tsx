import type React from "react"
import { Pressable, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../../theme/ThemeProvider"

interface ThemeToggleProps {
  size?: number
  style?: any
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24, style }) => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={size} color={isDarkMode ? "#FFF" : "#333"} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
  },
})
