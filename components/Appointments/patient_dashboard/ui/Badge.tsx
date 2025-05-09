"use client"

import type React from "react"
import { View, Text, StyleSheet, Animated, Pressable, useWindowDimensions } from "react-native"
import { useTheme } from "native-base"

type BadgeVariant = "solid" | "subtle" | "outline"
type BadgeSize = "xs" | "sm" | "md" | "lg"

interface BadgeProps {
  children: React.ReactNode
  colorScheme?: string
  variant?: BadgeVariant
  size?: BadgeSize
  style?: any
  textStyle?: any
  icon?: React.ReactNode
  isDisabled?: boolean
  onPress?: () => void
  accessibilityLabel?: string
  testID?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  colorScheme = "primary",
  variant = "subtle",
  size = "md",
  style,
  textStyle,
  icon,
  isDisabled = false,
  onPress,
  accessibilityLabel,
  testID,
}) => {
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const animatedScale = new Animated.Value(1)

  // Compute responsive size values based on screen width
  const isSmallScreen = width < 375

  // Default colors for fallback
  const defaultColors = {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  }

  // Safely access theme colors with fallbacks
  const getColor = (scheme: string, shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900) => {
    try {
      // @ts-ignore - We're handling potential errors with try-catch
      const colorObj = theme.colors[scheme]
      if (typeof colorObj === 'string') return colorObj
      // @ts-ignore - We know this is likely an object with color shades
      return colorObj?.[shade] || theme.colors.primary[shade] || defaultColors[shade]
    } catch (e) {
      return defaultColors[shade]
    }
  }

  const getBackgroundColor = () => {
    if (isDisabled) return getColor('gray', 200)
    if (variant === "solid") return getColor(colorScheme, 500)
    if (variant === "subtle") return getColor(colorScheme, 100)
    return "transparent"
  }

  const getTextColor = () => {
    if (isDisabled) return getColor('gray', 500)
    if (variant === "solid") return "white"
    if (variant === "subtle") return getColor(colorScheme, 800)
    return getColor(colorScheme, 500)
  }

  const getBorderColor = () => {
    if (isDisabled) return getColor('gray', 300)
    if (variant === "outline") return getColor(colorScheme, 500)
    return "transparent"
  }

  const getSizeStyles = () => {
    const sizeMap = {
      xs: {
        paddingHorizontal: isSmallScreen ? 4 : 6,
        paddingVertical: 1,
        fontSize: 10,
        borderRadius: 3,
      },
      sm: {
        paddingHorizontal: isSmallScreen ? 6 : 8,
        paddingVertical: isSmallScreen ? 1 : 2,
        fontSize: 11,
        borderRadius: 4,
      },
      md: {
        paddingHorizontal: isSmallScreen ? 8 : 10,
        paddingVertical: isSmallScreen ? 2 : 3,
        fontSize: 12,
        borderRadius: 5,
      },
      lg: {
        paddingHorizontal: isSmallScreen ? 10 : 12,
        paddingVertical: isSmallScreen ? 3 : 4,
        fontSize: 13,
        borderRadius: 6,
      },
    }

    return sizeMap[size]
  }

  const handlePressIn = () => {
    if (!isDisabled && onPress) {
      Animated.spring(animatedScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start()
    }
  }

  const handlePressOut = () => {
    if (!isDisabled && onPress) {
      Animated.spring(animatedScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start()
    }
  }

  const sizeStyles = getSizeStyles()

  const BadgeContent = (
    <Animated.View
      style={[
        {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? StyleSheet.hairlineWidth : 0,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: sizeStyles.borderRadius,
          transform: [{ scale: onPress ? animatedScale : 1 }],
          opacity: isDisabled ? 0.6 : 1,
          shadowColor: variant === "solid" ? "rgba(0,0,0,0.2)" : "transparent",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1.5,
          elevation: variant === "solid" ? 1 : 0,
        },
        style,
      ]}
    >
      {icon && <View style={{ marginRight: 4 }}>{icon}</View>}
      <Text
        style={[
          {
            fontSize: sizeStyles.fontSize,
            fontWeight: "600",
            textAlign: "center",
            letterSpacing: 0.25,
            color: getTextColor(),
          },
          textStyle,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {children}
      </Text>
    </Animated.View>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={!isDisabled ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `${children} badge`}
        accessibilityState={{ disabled: isDisabled }}
        testID={testID}
      >
        {BadgeContent}
      </Pressable>
    )
  }

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || `${children} badge`}
      testID={testID}
    >
      {BadgeContent}
    </View>
  )
}
