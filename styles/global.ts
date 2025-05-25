// styles/global.ts
import { Dimensions, StyleSheet, Platform } from 'react-native';

/**
 * Create cross-platform compatible shadow styles
 * @param elevation - Shadow elevation (1-24)
 * @param color - Shadow color (default black)
 * @returns - Platform-specific shadow styles
 */
export const createShadow = (
  elevation: number = 2,
  color: string = "#000",
  opacity: number = 0.2
) => {
  const height = Math.max(1, Math.round(elevation / 2));
  
  return Platform.select({
    web: {
      boxShadow: `0px ${height}px ${elevation}px rgba(0, 0, 0, ${opacity})`,
    },
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: height },
      shadowOpacity: opacity,
      shadowRadius: Math.max(1, Math.round(elevation / 2)),
    },
    android: {
      elevation: elevation,
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: height },
      shadowOpacity: opacity,
      shadowRadius: Math.max(1, Math.round(elevation / 2)),
      elevation: elevation,
    },
  });
};

const { width } = Dimensions.get('window');

// 1. Color Palette
const colors = {
  primary: '#4a90e2', // Calming blue
  primaryLight: '#a8c7f0', // Lighter shade of primary
  secondary: '#6cc070', // Soft green
  accent: '#f5a623', // Warm orange
  neutralLight: '#f0f0f0',
  neutralMedium: '#c0c0c0',
  neutralDark: '#333',
  error: '#d32f2f',
  danger: '#d32f2f', // Same as error, used in some components
  success: '#43a047',
  white: '#fff',
  black: '#000',
  grey: '#9e9e9e', // Medium grey for icons
  // Text colors
  text: '#333333', // Same as textPrimary for consistent naming
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  // Background colors
  background: '#f8f8f8', // Same as backgroundLight for consistent naming
  backgroundLight: '#f8f8f8',
  inputBackground: '#ffffff',
  border: '#e0e0e0',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// 2. Typography
const fonts = {
  // Use system fonts
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  headings: {
    h1: { fontSize: 32, fontWeight: '700' as const },
    h2: { fontSize: 24, fontWeight: '600' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
  },
  body: { fontSize: 16, fontWeight: '400' as const },
  label: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.neutralDark },
  captionBold: { fontSize: 12, fontWeight: '600' as const, color: colors.neutralDark },
  subtitle: { fontSize: 16, fontWeight: '500' as const, color: colors.neutralDark },
};

// 3. Spacing
const spacing = {
  xxs: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
  xxxl: 56,
};

const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
};

// 4. Components
const components = {
  button: StyleSheet.create({
    base: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 100,
    },
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondary,
    },
    disabled: {
      backgroundColor: colors.neutralMedium,
      opacity: 0.7,
    },
    text: {
      color: colors.white,
      fontWeight: 'bold',
      fontSize: fonts.body.fontSize,
    },
  }),
  input: StyleSheet.create({
    base: {
      width: '100%',
      padding: spacing.sm,
      marginVertical: spacing.xs,
      borderWidth: 1,
      borderColor: colors.neutralMedium,
      borderRadius: borderRadius.sm,
      fontSize: fonts.body.fontSize,
      color: colors.neutralDark,
      backgroundColor: colors.white,
    },
    error: {
      borderColor: colors.error,
    },
  }),
  card: StyleSheet.create({
    base: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      ...createShadow(2),
      marginBottom: spacing.sm,
    },
  }),
  avatar: StyleSheet.create({
    base: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.neutralLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: colors.neutralDark,
      fontWeight: 'bold',
    },
  }),
  badge: StyleSheet.create({
    base: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      minWidth: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: colors.white,
      fontSize: fonts.label.fontSize,
    },
  }),
  toast: StyleSheet.create({
    base: {
      backgroundColor: colors.neutralDark,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    text: {
      color: colors.white,
      fontSize: fonts.body.fontSize,
    },
    success: {
      backgroundColor: colors.success,
    },
    error: {
      backgroundColor: colors.error,
    },
  }),
  loadingIndicator: StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
    },
  }),
  separator: StyleSheet.create({
    horizontal: {
      height: 1,
      backgroundColor: colors.neutralMedium,
      marginVertical: spacing.sm,
      width: '100%',
    },
    vertical: {
      width: 1,
      backgroundColor: colors.neutralMedium,
      marginHorizontal: spacing.sm,
      height: '100%',
    },
  }),
};

// Native styles
const nativeStyleSheet = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch', // Changed to stretch
    backgroundColor: colors.neutralLight,
    padding: spacing.md,
  },
  // Example usage of components
  input: components.input.base,
  inputError: components.input.error,
  button: {
    ...components.button.base,
    ...components.button.primary,
  },
  secondaryButton: {
    ...components.button.base,
    ...components.button.secondary,
  },
  disabledButton: {
    ...components.button.base,
    ...components.button.disabled,
  },
  buttonText: components.button.text,
  card: components.card.base,
  avatar: components.avatar.base,
  avatarText: components.avatar.text,
  badge: components.badge.base,
  badgeText: components.badge.text,
  toast: components.toast.base,
  toastText: components.toast.text,
  toastSuccess: components.toast.success,
  toastError: components.toast.error,
  loading: components.loadingIndicator.base,
  separator: components.separator.horizontal,
  verticalSeparator: components.separator.vertical,
  // Text styles
  h1: fonts.headings.h1,
  h2: fonts.headings.h2,
  h3: fonts.headings.h3,
  body: fonts.body,
  label: fonts.label,
  caption: fonts.caption,
  errorText: {
    color: colors.error,
    fontSize: fonts.label.fontSize,
    marginTop: spacing.xxs,
  },
});

// Combined styles (including web-specific)
export const globalStyles = {
  ...nativeStyleSheet,
  colors,
  spacing,
  borderRadius,
  fonts,
  card: components.card.base,
  button: components.button.base,
  buttonText: components.button.text,
  h1: fonts.headings.h1,
  h2: fonts.headings.h2,
  h3: fonts.headings.h3,
  subtitle: fonts.subtitle,
  caption: fonts.caption,
  captionBold: fonts.captionBold,
  // Web-specific styles (if needed, adapt for React Native Web)
  container: {
    ...nativeStyleSheet.container,
    maxWidth: 480, // Limit content width on larger screens
    width: '100%',
  },
  '@media (min-width: 480px)': {
    container: {
      paddingHorizontal: spacing.xxl,
    },
  },
  // Animations (consider using React Native's Animated API for native)
  buttonHover: {
    transition: 'transform 0.1s ease',
    transform: 'scale(1.05)',
  },
  fadeIn: {
    animation: 'fadeIn 0.3s ease-out forwards',
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
};
