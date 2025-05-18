"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useColorScheme } from "react-native"

type ThemeType = "light" | "dark"

interface ThemeContextType {
  theme: ThemeType
  toggleTheme: () => void
  isDark: boolean
  colors: typeof lightColors
}

const lightColors = {
  background: "#F5F5F5",
  card: "#FFFFFF",
  text: "#000000",
  border: "#E5E5E5",
  primary: "#0070F3",
  secondary: "#6C757D",
  success: "#28A745",
  danger: "#DC3545",
  warning: "#FFC107",
  info: "#17A2B8",
  muted: "#6C757D",
  highlight: "#F8F9FA",
}

const darkColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  border: "#333333",
  primary: "#0070F3",
  secondary: "#6C757D",
  success: "#28A745",
  danger: "#DC3545",
  warning: "#FFC107",
  info: "#17A2B8",
  muted: "#A0A0A0",
  highlight: "#2C2C2C",
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
