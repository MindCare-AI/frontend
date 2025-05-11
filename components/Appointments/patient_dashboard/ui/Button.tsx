"use client"

import type React from "react"
import { Pressable, Text, StyleSheet, ActivityIndicator, Platform, View, useWindowDimensions } from "react-native"
import { useTheme as useNativeBase } from "native-base"
import { useTheme } from "../../../../theme/ThemeProvider"

type ButtonVariant = "solid" | "outline" | "ghost" | "link"
type ButtonSize = "xs" | "sm" | "md" | "lg"
type ColorScheme = "primary" | "secondary" | "tertiary" | "error" | "warning" | "success" | "info" | "gray" | "red" | "blue" | "green" | "yellow"

// Helper type for accessing color scales safely
type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

interface ButtonProps {
  children: React.ReactNode
  onPress?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  isDisabled?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  colorScheme?: ColorScheme
  style?: any
  textStyle?: any
  fullWidth?: boolean
  borderRadius?: number
  accessibilityLabel?: string
  accessibilityHint?: string
  testID?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = "solid",
  size = "md",
  isDisabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  colorScheme = "primary",
  style,
  textStyle,
  fullWidth = false,
  borderRadius = 999,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const nbTheme = useNativeBase()
  const { isDarkMode, colors } = useTheme()
  const { width } = useWindowDimensions()
  
  const isSmallScreen = width < 768
  
  // Helper function to safely get the color scheme
  const getColorSchemeObject = (): ColorScale => {
    try {
      const colorObj = nbTheme.colors[colorScheme as keyof typeof nbTheme.colors];
      // Check if colorObj has the required structure
      if (colorObj && typeof colorObj === 'object' && '500' in colorObj) {
        return colorObj as ColorScale;
      }
    } catch (e) {
      // If any errors occur, fall back to primary
    }
    return nbTheme.colors.primary as ColorScale;
  }
  
  const getBackgroundColor = (): string => {
    if (isDisabled) return isDarkMode ? nbTheme.colors.gray[700] : nbTheme.colors.gray[300]
    if (variant === "solid") {
      const colorObj = getColorSchemeObject();
      return colorObj[500];
    }
    return "transparent"
  }

  const getTextColor = (): string => {
    if (isDisabled) return isDarkMode ? nbTheme.colors.gray[400] : nbTheme.colors.gray[500]
    if (variant === "solid") return "white"
    
    const colorObj = getColorSchemeObject();
    return colorObj[isDarkMode ? 300 : 500];
  }

  const getBorderColor = (): string => {
    if (isDisabled) return isDarkMode ? nbTheme.colors.gray[700] : nbTheme.colors.gray[300]
    if (variant === "outline") {
      const colorObj = getColorSchemeObject();
      return colorObj[isDarkMode ? 300 : 500];
    }
    return "transparent"
  }
  const getPadding = () => {
    // Ensure minimum touch target size of 48px
    const minHeight = 48;
    const basePadding: Record<ButtonSize, { paddingVertical: number, paddingHorizontal: number, minHeight: number }> = {
      xs: { paddingVertical: 12, paddingHorizontal: 16, minHeight },
      sm: { paddingVertical: 14, paddingHorizontal: 20, minHeight },
      md: { paddingVertical: 16, paddingHorizontal: 24, minHeight },
      lg: { paddingVertical: 20, paddingHorizontal: 32, minHeight }
    }
    
    // For small screens, maintain minimum touch target while adjusting padding
    if (isSmallScreen) {
      return {
        paddingVertical: Math.max(basePadding[size].paddingVertical * 0.9, 12),
        paddingHorizontal: basePadding[size].paddingHorizontal * 0.9,
        minHeight
      }
    }
    
    return basePadding[size]
  }
  const getFontSize = () => {
    // Adjust font size based on screen size for better readability
    const baseFontSize: Record<ButtonSize, number> = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18
    }
    
    // For small screens, reduce font size slightly
    if (isSmallScreen) {
      return baseFontSize[size] * 0.95
    }
    
    return baseFontSize[size]
  }

  // Get hover and active state styles for web
  const getInteractionStyles = (pressed: boolean) => {
    if (isDisabled || isLoading) return {}
    
    const baseScale = 1;
    const pressedScale = 0.98;
    const baseOpacity = 1;
    const pressedOpacity = 0.8;
    
    return {
      opacity: pressed ? pressedOpacity : baseOpacity,
      transform: pressed ? [{ scale: pressedScale }] : [{ scale: baseScale }],
      ...Platform.select({
        web: {
          transition: 'all 0.2s ease',
          '&:hover': {
            opacity: 0.9,
            transform: [{ scale: 1.02 }],
          },
          '&:active': {
            opacity: pressedOpacity,
            transform: [{ scale: pressedScale }],
          },
        },
      }),
    }
  }

  return (
    <View style={[fullWidth && styles.fullWidth]}>
      <Pressable
        onPress={isDisabled || isLoading ? undefined : onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: variant === "outline" ? 1 : 0,
            borderRadius: borderRadius,
            ...getPadding(),
            ...(fullWidth ? { width: '100%' } : {}),
          },
          getInteractionStyles(pressed),
          style,
        ]}
        disabled={isDisabled || isLoading}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled || isLoading }}
        accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
        accessibilityHint={accessibilityHint}
        testID={testID}
      >
        {isLoading && (
          <ActivityIndicator 
            size={size === "xs" ? "small" : "small"} 
            color={getTextColor()} 
            style={styles.loadingIndicator} 
            accessibilityLabel="Loading"
          />
        )}
        {!isLoading && leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
              marginLeft: leftIcon && !isLoading ? 8 : 0,
              marginRight: rightIcon ? 8 : 0,
              opacity: isLoading ? 0.7 : 1,
              fontWeight: '700',
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
        {!isLoading && rightIcon && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: 'hidden',
    minWidth: 64,
    minHeight: 48, // Ensure minimum touch target size
    ...Platform.select({
      web: {
        cursor: "pointer",
        userSelect: "none" as any,
        outlineStyle: "none" as any,
        transition: "all 0.2s ease",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation" as any,
        '&:focus-visible': {
          outline: '2px solid #007AFF',
          outlineOffset: '2px',
        },
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
    flexShrink: 1,
    ...Platform.select({
      web: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      },
    }),
  },
  loadingIndicator: {
    marginRight: 8,
  },
  fullWidth: {
    width: '100%',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  }
})
