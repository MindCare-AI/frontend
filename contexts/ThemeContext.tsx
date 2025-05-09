"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useColorScheme } from "react-native"

type ThemeType = "light" | "dark"

interface ThemeContextType {
  theme: ThemeType
  toggleTheme: () => void
  colors: {
    background: string
    card: string
    text: string
    border: string
    primary: string
    primaryLight: string
    secondary: string
    muted: string
    success: string
    warning: string
    danger: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme()
  const [theme, setTheme] = useState<ThemeType>(colorScheme === "dark" ? "dark" : "light")

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const lightColors = {
    background: "#E8F5F5",
    card: "#FFFFFF",
    text: "#333333",
    border: "#D1EBEB",
    primary: "#2D9494",
    primaryLight: "#A3D7D7",
    secondary: "#75C3C3",
    muted: "#6B7280",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  }

  const darkColors = {
    background: "#1A2B2B",
    card: "#2A3B3B",
    text: "#E5E7EB",
    border: "#3A4B4B",
    primary: "#4AAAAA",
    primaryLight: "#75C3C3",
    secondary: "#A3D7D7",
    muted: "#9CA3AF",
    success: "#34D399",
    warning: "#FBBF24",
    danger: "#F87171",
  }

  const colors = theme === "light" ? lightColors : darkColors

  return <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
