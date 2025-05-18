import type React from "react"
import { Pressable, StyleSheet, Animated, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../../../theme/ThemeProvider"
import { useEffect, useRef } from "react"

interface ThemeToggleProps {
  size?: number
  style?: any
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24, style }) => {
  const { isDarkMode, toggleTheme } = useTheme()
  const rotateAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: isDarkMode ? 1 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
      ]),
    ]).start()
  }, [isDarkMode])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPress={toggleTheme}
        style={({ pressed }) => [
          styles.button,
          {
            opacity: pressed ? 0.7 : 1,
            backgroundColor: isDarkMode ? '#2C2C2C' : '#F5F5F5',
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        accessibilityHint="Double tap to toggle between light and dark theme"
      >
        <Animated.View
          style={{
            transform: [{ rotate: spin }, { scale: scaleAnim }],
          }}
        >
          <Ionicons
            name={isDarkMode ? "sunny" : "moon"}
            size={size}
            color={isDarkMode ? "#FFD700" : "#333"}
          />
        </Animated.View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: 12,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})
