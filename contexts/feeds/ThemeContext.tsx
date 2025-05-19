"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useColorScheme } from "react-native"

type ThemeType = "light" | "dark"

interface ThemeContextType {
  theme: ThemeType
  toggleTheme: () => void
  isDark: boolean
  colors: ThemeColors
}

// Update your ThemeColors interface to include error and white
interface ThemeColors {
  background: string
  card: string
  text: string
  border: string
  primary: string
  secondary: string
  success: string
  danger: string
  warning: string
  info: string
  muted: string
  highlight: string
  error: string // Add this
  white: string // Add this
}

// Updated colors to match journaling theme (blue/white)
const lightColors: ThemeColors = {
  background: "#F5FAFF", // Light blue background
  card: "#FFFFFF", // White card background
  text: "#2C3E50", // Dark blue text
  border: "#D4E6F9", // Light blue border
  primary: "#0070F3", // Primary blue
  secondary: "#6C757D", // Secondary gray
  success: "#28A745", // Success green
  danger: "#DC3545", // Danger red
  warning: "#FFC107", // Warning yellow
  info: "#17A2B8", // Info teal
  muted: "#8898AA", // Muted text
  highlight: "#EDF2FF", // Light blue highlight
  error: "#D32F2F", // Add this - a standard error red
  white: "#FFFFFF", // Add this
}

const darkColors: ThemeColors = {
  background: "#121F33", // Dark blue background
  card: "#1E293B", // Darker blue card
  text: "#FFFFFF", // White text
  border: "#2D3748", // Dark border
  primary: "#3B82F6", // Primary blue (lighter for dark mode)
  secondary: "#6C757D", // Secondary gray
  success: "#2ECC71", // Success green
  danger: "#E74C3C", // Danger red
  warning: "#F39C12", // Warning yellow
  info: "#3498DB", // Info blue
  muted: "#A0AEC0", // Muted text
  highlight: "#2D3748", // Dark blue highlight
  error: "#EF5350", // Add this - a slightly lighter red for dark mode
  white: "#FFFFFF", // Add this
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  isDark: false,
  colors: lightColors,
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme()
  const [theme, setTheme] = useState<ThemeType>(deviceTheme === "dark" ? "dark" : "light")

  useEffect(() => {
    setTheme(deviceTheme === "dark" ? "dark" : "light")
  }, [deviceTheme])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const isDark = theme === "dark"
  const colors = isDark ? darkColors : lightColors

  return <ThemeContext.Provider value={{ theme, toggleTheme, isDark, colors }}>{children}</ThemeContext.Provider>
}
