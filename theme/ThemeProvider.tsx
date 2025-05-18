"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorMode, useTheme as useNBTheme } from "native-base"
import { Appearance } from "react-native"

// Define theme types
type ThemeType = "light" | "dark" | "system"

// Create context
type ThemeContextType = {
  theme: ThemeType
  toggleTheme: () => void
  setTheme: (theme: ThemeType) => void
  isDarkMode: boolean
  colors: any
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Define the theme colors
const lightTheme = {
  colors: {
    primary: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#4A90E2", // Primary color
      600: "#3A80D2",
      700: "#1976d2",
      800: "#1565c0",
      900: "#0d47a1",
    },
    secondary: {
      50: "#F5F5F5", // Secondary color
      100: "#f0f0f0",
      200: "#e6e6e6",
      300: "#d6d6d6",
      400: "#c2c2c2",
      500: "#a3a3a3",
      600: "#858585",
      700: "#666666",
      800: "#333333",
      900: "#1f1f1f",
    },
    background: {
      light: "#FFFFFF",
      dark: "#121212",
    },
    card: {
      light: "#FFFFFF",
      dark: "#1E1E1E",
    },
    text: {
      light: "#333333",
      dark: "#F5F5F5",
    },
    border: {
      light: "#E2E8F0",
      dark: "#2D3748",
    },
  },
}

const darkTheme = {
  colors: {
    ...lightTheme.colors,
    primary: {
      ...lightTheme.colors.primary,
      500: "#5A9FF2", // Slightly lighter for dark mode
    },
    background: {
      ...lightTheme.colors.background,
    },
    card: {
      ...lightTheme.colors.card,
    },
    text: {
      ...lightTheme.colors.text,
    },
    border: {
      ...lightTheme.colors.border,
    },
  },
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colorMode, toggleColorMode, setColorMode } = useColorMode()
  const [theme, setThemeState] = useState<ThemeType>("system")
  const nbTheme = useNBTheme()

  // Initialize theme based on system preference
  useEffect(() => {
    const colorScheme = Appearance.getColorScheme()
    if (theme === "system") {
      setColorMode(colorScheme === "dark" ? "dark" : "light")
    }
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    if (theme === "system") {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setColorMode(colorScheme === "dark" ? "dark" : "light")
      })

      return () => {
        subscription.remove()
      }
    }
  }, [theme, setColorMode])

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme)
    if (newTheme === "system") {
      const colorScheme = Appearance.getColorScheme()
      setColorMode(colorScheme === "dark" ? "dark" : "light")
    } else {
      setColorMode(newTheme)
    }
  }

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(colorMode === "dark" ? "light" : "dark")
    } else {
      setTheme(theme === "dark" ? "light" : "dark")
    }
  }

  const isDarkMode = colorMode === "dark"
  const colors = isDarkMode ? darkTheme.colors : lightTheme.colors

  const value = {
    theme,
    toggleTheme,
    setTheme,
    isDarkMode,
    colors,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
