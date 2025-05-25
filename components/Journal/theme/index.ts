import { Platform } from "react-native"

export const colors = {
  primary: "#4A90E2",
  secondary: "#F5F5F5",
  danger: "#D32F2F",
  warning: "#FFC107",
  success: "#4CAF50",
  info: "#2196F3",
  dark: "#333333",
  light: "#F8F8F8",
  white: "#FFFFFF",
  black: "#333333",
  gray: "#666666",
  lightGray: "#E2E8F0",
  darkGray: "#4A5568",
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.5)",
  background: "#F8FAFC",
  cardBackground: "#FFFFFF",
  textPrimary: "#333333",
  textSecondary: "#666666",
  border: "#E2E8F0",
  accent: "#667EEA",
  softBlue: "#EBF4FF",
}

// Modern gradient colors for journal categories
export const journalColors = [
  "#FF512F", // Orange-Red gradient start
  "#FF61D2", // Pink gradient start
  "#72FFB6", // Green gradient start
  "#00C0FF", // Blue gradient start
  "#FDABDD", // Pink-Gray gradient start
  "#FF3E9D", // Magenta gradient start
  "#667EEA", // Purple-Blue
  "#4ECDC4", // Teal
  "#45B7D1", // Sky Blue
  "#96CEB4", // Mint
  "#F093FB", // Light Purple
  "#F093FB", // Gradient Purple
]

// Gradient definitions for modern journal colors
export const journalGradients = [
  { start: "#FF512F", end: "#DD2476" }, // Fiery Red
  { start: "#FF61D2", end: "#FE9090" }, // Pink Sunset
  { start: "#72FFB6", end: "#10D164" }, // Fresh Green
  { start: "#00C0FF", end: "#4218B8" }, // Ocean Blue
  { start: "#FDABDD", end: "#374A5A" }, // Soft Pink to Gray
  { start: "#FF3E9D", end: "#0E1F40" }, // Magenta to Dark
  { start: "#667EEA", end: "#764BA2" }, // Purple Haze
  { start: "#4ECDC4", end: "#44A08D" }, // Teal Dreams
  { start: "#45B7D1", end: "#2E86C1" }, // Sky Flow
  { start: "#96CEB4", end: "#52C788" }, // Mint Fresh
  { start: "#F093FB", end: "#F5576C" }, // Cotton Candy
  { start: "#A8EDEA", end: "#FAD0C4" }, // Peachy Mint
]

// Helper function to get gradient colors
export const getGradientColors = (index: number) => {
  const gradientIndex = index % journalGradients.length
  return journalGradients[gradientIndex]
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
}

// Enhanced shadows with more depth
export const shadows = Platform.select({
  ios: {
    sm: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    md: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    lg: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    xl: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
    },
  },
  android: {
    sm: { elevation: 3 },
    md: { elevation: 6 },
    lg: { elevation: 12 },
    xl: { elevation: 18 },
  },
  default: {
    sm: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    md: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    lg: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    xl: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
    },
  },
})

// Animation configurations
export const animations = {
  spring: {
    tension: 100,
    friction: 8,
  },
  timing: {
    duration: 250,
  },
  easing: {
    ease: 'ease-out',
    spring: 'spring(1, 0.8, 0)',
  }
}
