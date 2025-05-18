import { MD3LightTheme, configureFonts } from "react-native-paper"

const fontConfig = {
  labelSmall: {
    fontFamily: "System",
    fontWeight: "500" as "500",
    letterSpacing: 0.5,
    lineHeight: 16,
    fontSize: 11,
  },
  labelMedium: {
    fontFamily: "System",
    fontWeight: "500" as "500",
    letterSpacing: 0.5,
    lineHeight: 16,
    fontSize: 12,
  },
  labelLarge: {
    fontFamily: "System",
    fontWeight: "500" as "500",
    letterSpacing: 0.5,
    lineHeight: 20,
    fontSize: 14,
  },
  bodySmall: {
    fontFamily: "System",
    fontWeight: "400" as "400",
    letterSpacing: 0.4,
    lineHeight: 16,
    fontSize: 12,
  },
  bodyMedium: {
    fontFamily: "System",
    fontWeight: "400" as "400",
    letterSpacing: 0.25,
    lineHeight: 20,
    fontSize: 14,
  },
  bodyLarge: {
    fontFamily: "System",
    fontWeight: "400" as "400",
    letterSpacing: 0.15,
    lineHeight: 24,
    fontSize: 16,
  },
  titleSmall: {
    fontFamily: "System",
    fontWeight: "500" as "500",
    letterSpacing: 0.1,
    lineHeight: 20,
    fontSize: 14,
  },
  titleMedium: {
    fontFamily: "System",
    fontWeight: "500" as "500",
    letterSpacing: 0.15,
    lineHeight: 24,
    fontSize: 16,
  },
  titleLarge: {
    fontFamily: "System",
    fontWeight: "400" as "400",
    letterSpacing: 0,
    lineHeight: 28,
    fontSize: 22,
  },
  headlineSmall: {
    fontFamily: "System",
    fontWeight: "400" as "400",
    letterSpacing: 0,
    lineHeight: 32,
    fontSize: 24,
  },
  headlineMedium: {
    fontFamily: "System",
    fontWeight: "400" as "400",
    letterSpacing: 0,
    lineHeight: 36,
    fontSize: 28,
  },
  headlineLarge: {
    fontFamily: "System",
    fontWeight: "400" as "400",
    letterSpacing: 0,
    lineHeight: 40,
    fontSize: 32,
  },
  displaySmall: {
    fontFamily: "System",
    fontWeight: "400" as "400",
    letterSpacing: 0,
    lineHeight: 44,
    fontSize: 36,
  },
  displayMedium: {
    fontFamily: "System",
    fontWeight: "400" as "400",
    letterSpacing: 0,
    lineHeight: 52,
    fontSize: 45,
  },
  displayLarge: {
    fontFamily: "System",
    fontWeight: "400" as "400",
    letterSpacing: 0,
    lineHeight: 64,
    fontSize: 57,
  },
}

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6750A4",
    secondary: "#625B71",
    tertiary: "#7D5260",
    background: "#F6F6F6",
    surface: "#FFFFFF",
    error: "#B3261E",
    // Custom colors for mood ratings
    moodVeryLow: "#1E40AF", // dark blue
    moodLow: "#3B82F6", // blue
    moodModerate: "#FACC15", // yellow
    moodGood: "#4ADE80", // light green
    moodExcellent: "#16A34A", // green
  },
  fonts: configureFonts({ config: fontConfig }),
}

// Helper function to get mood color based on rating
export const getMoodColor = (rating: number): string => {
  // Default colors in case theme is undefined
  const defaultColors = {
    moodVeryLow: "#1E40AF", // dark blue
    moodLow: "#3B82F6", // blue
    moodModerate: "#FACC15", // yellow
    moodGood: "#4ADE80", // light green
    moodExcellent: "#16A34A", // green
  };

  if (rating <= 2) return theme?.colors?.moodVeryLow || defaultColors.moodVeryLow;
  if (rating <= 4) return theme?.colors?.moodLow || defaultColors.moodLow;
  if (rating <= 6) return theme?.colors?.moodModerate || defaultColors.moodModerate;
  if (rating <= 8) return theme?.colors?.moodGood || defaultColors.moodGood;
  return theme?.colors?.moodExcellent || defaultColors.moodExcellent;
}

// Helper function to get mood text color based on rating
export const getMoodTextColor = (rating: number): string => {
  if (rating <= 4 || rating > 8) return "#FFFFFF"; // White text for dark backgrounds
  return "#000000"; // Black text for light backgrounds
}
