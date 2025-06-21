"use client"

import type React from "react"
import { Pressable, Text, StyleSheet, ActivityIndicator, Platform, View, useWindowDimensions } from "react-native"
import { useTheme as useNativeBase } from "native-base"
import { useTheme } from "../../../../theme/ThemeProvider"
import { Ionicons } from "@expo/vector-icons"

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
  icon?: string // Ionicons name
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
  borderRadius = 12, // More rounded but not pill shape by default
  accessibilityLabel,
  accessibilityHint,
  testID,
  icon,
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
  
  // Get appropriate colors based on variant and state
  const getBackgroundColor = () => {
    if (isDisabled) return isDarkMode ? nbTheme.colors.gray[700] : nbTheme.colors.gray[200]
    
    const colorObj = getColorSchemeObject();
    switch (variant) {
      case "solid":
        return colorObj[500];
      case "ghost":
        return "transparent";
      case "outline":
        return "transparent";
      case "link":
        return "transparent";
      default:
        return colorObj[500];
    }
  }

  const getHoverBackgroundColor = () => {
    if (isDisabled) return isDarkMode ? nbTheme.colors.gray[700] : nbTheme.colors.gray[200]
    
    const colorObj = getColorSchemeObject();
    switch (variant) {
      case "solid":
        return colorObj[600];
      case "ghost":
        return isDarkMode ? `rgba(${hexToRgb(colorObj[200])}, 0.12)` : `rgba(${hexToRgb(colorObj[500])}, 0.08)`;
      case "outline":
        return isDarkMode ? `rgba(${hexToRgb(colorObj[200])}, 0.12)` : `rgba(${hexToRgb(colorObj[500])}, 0.08)`;
      case "link":
        return "transparent";
      default:
        return colorObj[600];
    }
  }

  const getPressedBackgroundColor = () => {
    if (isDisabled) return isDarkMode ? nbTheme.colors.gray[700] : nbTheme.colors.gray[200]
    
    const colorObj = getColorSchemeObject();
    switch (variant) {
      case "solid":
        return colorObj[700];
      case "ghost":
        return isDarkMode ? `rgba(${hexToRgb(colorObj[200])}, 0.2)` : `rgba(${hexToRgb(colorObj[500])}, 0.12)`;
      case "outline":
        return isDarkMode ? `rgba(${hexToRgb(colorObj[200])}, 0.2)` : `rgba(${hexToRgb(colorObj[500])}, 0.12)`;
      case "link":
        return "transparent";
      default:
        return colorObj[700];
    }
  }

  const getTextColor = () => {
    if (isDisabled) return isDarkMode ? nbTheme.colors.gray[400] : nbTheme.colors.gray[500]
    
    const colorObj = getColorSchemeObject();
    switch (variant) {
      case "solid":
        return "#FFFFFF";
      case "ghost":
      case "outline":
      case "link":
        return colorObj[isDarkMode ? 300 : 600];
      default:
        return "#FFFFFF";
    }
  }

  const getBorderColor = () => {
    if (isDisabled) return isDarkMode ? nbTheme.colors.gray[700] : nbTheme.colors.gray[300]
    
    const colorObj = getColorSchemeObject();
    return variant === "outline" ? colorObj[isDarkMode ? 300 : 600] : "transparent";
  }
  
  // Calculate sizing based on screen size
  const getPadding = () => {
    const basePadding: Record<ButtonSize, { paddingVertical: number, paddingHorizontal: number, minHeight: number }> = {
      xs: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 32 },
      sm: { paddingVertical: 10, paddingHorizontal: 16, minHeight: 36 },
      md: { paddingVertical: 12, paddingHorizontal: 20, minHeight: 44 },
      lg: { paddingVertical: 14, paddingHorizontal: 24, minHeight: 52 }
    }
    
    // Adjust for smaller screens
    if (isSmallScreen) {
      return {
        paddingVertical: Math.max(basePadding[size].paddingVertical * 0.9, 8),
        paddingHorizontal: basePadding[size].paddingHorizontal * 0.9,
        minHeight: basePadding[size].minHeight
      }
    }
    
    return basePadding[size]
  }
  
  const getFontSize = () => {
    const baseFontSize: Record<ButtonSize, number> = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18
    }
    
    return isSmallScreen ? baseFontSize[size] * 0.95 : baseFontSize[size]
  }

  // Helper to convert hex to RGB for rgba usage
  const hexToRgb = (hex: string) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert 3-digit hex to 6-digits
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  }

  // Enhanced interaction styles for better feedback
  const getInteractionStyles = (pressed: boolean) => {
    if (isDisabled || isLoading) return {}
    
    return {
      backgroundColor: pressed ? getPressedBackgroundColor() : getBackgroundColor(),
      transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
      ...Platform.select({
        web: {
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          ':hover': {
            backgroundColor: getHoverBackgroundColor(),
            transform: [{ scale: 1.01 }],
          },
        },
      }),
    }
  }

  // Auto-generate icon if needed
  const renderIcon = () => {
    if (icon) {
      return <Ionicons name={icon as any} size={getFontSize() + 2} color={getTextColor()} />;
    }
    return null;
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
        android_ripple={variant !== 'link' ? { 
          color: getPressedBackgroundColor(),
          borderless: false,
          radius: -1
        } : undefined}
      >
        {isLoading && (
          <ActivityIndicator 
            size="small" 
            color={getTextColor()} 
            style={styles.loadingIndicator} 
          />
        )}
        
        {!isLoading && (leftIcon || renderIcon()) && (
          <View style={styles.iconContainer}>
            {leftIcon || renderIcon()}
          </View>
        )}
        
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
              marginLeft: (leftIcon || renderIcon()) && !isLoading ? 8 : 0,
              marginRight: rightIcon ? 8 : 0,
              opacity: isLoading ? 0.8 : 1,
            },
            textStyle,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
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
    borderWidth: 1,
    borderColor: 'transparent',
    ...Platform.select({
      web: {
        userSelect: "none" as any,
        outlineStyle: "none" as any,
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation" as any,
        cursor: 'pointer',
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
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
