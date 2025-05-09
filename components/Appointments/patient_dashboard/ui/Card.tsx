"use client"

import type React from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  Dimensions, 
  Pressable,
  Animated,
  useWindowDimensions
} from "react-native"
import { useTheme as useNativeBase } from "native-base"
import { useTheme } from "../../../../theme/ThemeProvider"
import { AccessibilityProps } from "react-native"
import { useState, useRef, useEffect } from "react"

// Get device screen dimensions for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get("window")

// Custom hook for handling dynamic responsive values
export const useResponsiveValues = () => {
  const dimensions = useWindowDimensions()
  
  const isSmallScreen = dimensions.width < 768
  const isMediumScreen = dimensions.width >= 768 && dimensions.width < 1024
  const isLargeScreen = dimensions.width >= 1024
  
  return {
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    width: dimensions.width,
    height: dimensions.height
  }
}

interface CardProps {
  children: React.ReactNode
  style?: any
  onPress?: () => void
  accessibilityLabel?: string
  testID?: string
  elevation?: number // Control shadow depth
  width?: number | string // Support for custom widths
  margin?: number // Custom margin
  borderRadius?: number // Custom border radius
  padding?: number | string // Custom padding
  noBorder?: boolean // Option to remove border
  animateOnPress?: boolean // Enable press animation
  hoverStyle?: any // Style to apply on hover (web)
  maxWidth?: number | string // Maximum width
  minHeight?: number | string // Minimum height
  centered?: boolean // Center content
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  onPress, 
  accessibilityLabel, 
  testID, 
  elevation = 2,
  width,
  margin,
  borderRadius,
  padding,
  noBorder = false,
  animateOnPress = true,
  hoverStyle,
  maxWidth,
  minHeight,
  centered = false
}) => {
  const nbTheme = useNativeBase()
  const { isDarkMode, colors } = useTheme()
  const responsive = useResponsiveValues()
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  // Handle press animation
  const handlePressIn = () => {
    setIsPressed(true)
    if (animateOnPress && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        friction: 8,
        tension: 100,
        useNativeDriver: true
      }).start()
    }
  }
  
  const handlePressOut = () => {
    setIsPressed(false)
    if (animateOnPress && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      }).start()
    }
  }
  
  // Create responsive styles based on platform and screen size
  const responsiveStyles = {
    width: width || (responsive.isSmallScreen ? '100%' : responsive.isMediumScreen ? '90%' : '80%'),
    maxWidth: maxWidth,
    minHeight: minHeight,
    margin: margin !== undefined ? margin : (responsive.isSmallScreen ? 8 : 16),
    borderRadius: borderRadius !== undefined ? borderRadius : (responsive.isSmallScreen ? 8 : 12),
    padding: padding,
    borderWidth: noBorder ? 0 : 1,
    ...centered && { justifyContent: 'center', alignItems: 'center' },
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: elevation },
        shadowOpacity: isDarkMode ? 0.4 : 0.2,
        shadowRadius: elevation * 2,
      },
      android: {
        elevation: elevation,
      },
      web: {
        boxShadow: `0px ${elevation}px ${elevation * 2}px rgba(0, 0, 0, ${isDarkMode ? 0.4 : 0.2})`,
        transition: 'all 0.2s ease-in-out',
        cursor: onPress ? 'pointer' : 'default',
        ...(isHovered && onPress && hoverStyle ? hoverStyle : {}),
        ...(isHovered && onPress && !hoverStyle ? {
          transform: 'translateY(-2px)',
          boxShadow: `0px ${elevation + 2}px ${elevation * 3}px rgba(0, 0, 0, ${isDarkMode ? 0.5 : 0.3})`,
        } : {})
      }
    })
  }

  // Web-specific mouse events
  const webEvents = Platform.OS === 'web' ? {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  } : {}

  // Create accessibility props
  const accessibilityProps: AccessibilityProps = {
    accessible: true,
    accessibilityLabel: accessibilityLabel || 'Card',
    accessibilityRole: 'none',
  }

  // Use Animated.View when animations are needed, otherwise regular View/Pressable
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
  const AnimatedView = Animated.createAnimatedComponent(View)
  
  const CardComponent = onPress ? (animateOnPress ? AnimatedPressable : Pressable) : 
                                    (animateOnPress ? AnimatedView : View)
  
  const animationStyle = animateOnPress ? { 
    transform: [{ scale: scaleAnim }] 
  } : {}
  
  return (
    <CardComponent
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? colors.card.dark : colors.card.light,
          borderColor: isDarkMode ? nbTheme.colors.gray[700] : nbTheme.colors.gray[200],
        },
        responsiveStyles,
        animationStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={testID}
      {...webEvents}
      {...accessibilityProps}
      {...(onPress && { 
        accessibilityRole: 'button', 
        accessibilityHint: 'Double tap to activate',
        accessibilityState: { 
          pressed: isPressed,
          disabled: false
        }
      })}
    >
      {children}
    </CardComponent>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  style?: any
  border?: boolean // Option to add bottom border
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style, border = false }) => {
  const { isDarkMode } = useTheme()
  const responsive = useResponsiveValues()
  const nbTheme = useNativeBase()
  
  return (
    <View style={[
      styles.cardHeader, 
      {
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: isDarkMode ? nbTheme.colors.gray[700] : nbTheme.colors.gray[200],
        padding: responsive.isSmallScreen ? 12 : 16,
      },
      style
    ]}>
      {children}
    </View>
  )
}

interface CardContentProps {
  children: React.ReactNode
  style?: any
  padding?: number | string
  centered?: boolean
}

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  style,
  padding,
  centered = false
}) => {
  const responsive = useResponsiveValues()
  
  return (
    <View style={[
      styles.cardContent, 
      {
        padding: padding !== undefined ? padding : (responsive.isSmallScreen ? 12 : 16),
        ...(centered && { justifyContent: 'center', alignItems: 'center' })
      },
      style
    ]}>
      {children}
    </View>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  style?: any
  border?: boolean
  alignment?: 'start' | 'center' | 'end' | 'space-between'
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  style,
  border = false,
  alignment = 'end'
}) => {
  const { isDarkMode } = useTheme()
  const nbTheme = useNativeBase()
  const responsive = useResponsiveValues()
  
  // Map alignment to flexbox property
  const justifyContentMap = {
    'start': 'flex-start',
    'center': 'center',
    'end': 'flex-end',
    'space-between': 'space-between'
  }
  
  return (
    <View style={[
      styles.cardFooter, 
      {
        borderTopWidth: border ? 1 : 0,
        borderTopColor: isDarkMode ? nbTheme.colors.gray[700] : nbTheme.colors.gray[200],
        padding: responsive.isSmallScreen ? 12 : 16,
        justifyContent: justifyContentMap[alignment]
      },
      style
    ]}>
      {children}
    </View>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  style?: any
  size?: 'small' | 'medium' | 'large'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
}

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  style,
  size = 'medium',
  weight = 'semibold'
}) => {
  const { isDarkMode } = useTheme()
  const responsive = useResponsiveValues()

  // Map size to fontSize
  const fontSizeMap = {
    'small': responsive.isSmallScreen ? 16 : 18,
    'medium': responsive.isSmallScreen ? 18 : 20,
    'large': responsive.isSmallScreen ? 20 : 24
  }
  
  // Map weight to fontWeight
  const fontWeightMap = {
    'normal': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700'
  }

  return (
    <Text
      style={[
        styles.cardTitle,
        {
          color: isDarkMode ? "#FFFFFF" : "#000000",
          fontSize: fontSizeMap[size],
          fontWeight: fontWeightMap[weight]
        },
        style,
      ]}
    >
      {children}
    </Text>
  )
}

interface CardDescriptionProps {
  children: React.ReactNode
  style?: any
  size?: 'small' | 'medium' | 'large'
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ 
  children, 
  style,
  size = 'medium'
}) => {
  const nbTheme = useNativeBase()
  const { isDarkMode } = useTheme()
  const responsive = useResponsiveValues()

  // Map size to fontSize
  const fontSizeMap = {
    'small': responsive.isSmallScreen ? 12 : 13,
    'medium': responsive.isSmallScreen ? 14 : 15,
    'large': responsive.isSmallScreen ? 16 : 17
  }

  return (
    <Text
      style={[
        styles.cardDescription,
        {
          color: isDarkMode ? nbTheme.colors.gray[400] : nbTheme.colors.gray[500],
          fontSize: fontSizeMap[size]
        },
        style,
      ]}
    >
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // Enable hardware acceleration on web for smoother animations
    ...(Platform.OS === 'web' && {
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      WebkitTapHighlightColor: 'transparent',
      outline: 'none',
    }),
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  cardContent: {
    padding: 16,
    flex: 1, // Allow content to expand to fill available space
  },
  cardFooter: {
    padding: 16,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap", // Allow buttons to wrap on small screens
    rowGap: 8, // Spacing between wrapped items
    columnGap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    flexWrap: "wrap", // Allow text to wrap properly
  },
  cardDescription: {
    fontSize: 14,
    flexWrap: "wrap", // Allow text to wrap properly
    lineHeight: 20, // Improve readability with better line height
  },
})
