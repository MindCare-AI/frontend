import { useTheme } from "react-native-paper";
import { theme as defaultTheme } from "./theme";

// This hook returns the app theme, falling back to default theme if needed
export const useAppTheme = () => {
  const paperTheme = useTheme();
  
  // Return the Paper theme if available, otherwise use our default theme
  return paperTheme || defaultTheme;
};

// Helper function to get mood color based on rating using a provided theme
export const getMoodColorWithTheme = (rating: number, theme: any): string => {
  if (rating <= 2) return theme.colors.moodVeryLow;
  if (rating <= 4) return theme.colors.moodLow;
  if (rating <= 6) return theme.colors.moodModerate;
  if (rating <= 8) return theme.colors.moodGood;
  return theme.colors.moodExcellent;
};
