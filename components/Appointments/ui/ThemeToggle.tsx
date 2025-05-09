"use client"
import { TouchableOpacity, StyleSheet, Platform, Pressable } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../../contexts/ThemeContext"
import { useState } from "react";
import { View } from "react-native";

export default function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  if (Platform.OS === "web") {
    return (
      <div
        style={{
          ...styles.toggle,
          backgroundColor: colors.background,
          opacity: isHovered ? 0.8 : 1,
          cursor: "pointer",
        }}
        onClick={toggleTheme}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        <Feather name={theme === "light" ? "moon" : "sun"} size={18} color={colors.primary} />
      </div>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.toggle, { backgroundColor: colors.background }]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <Feather name={theme === "light" ? "moon" : "sun"} size={18} color={colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
})
