"use client"

import React from "react"
import { View, Text, StyleSheet, Platform, Pressable, Image, ImageSourcePropType } from "react-native"
import { useTheme as useNativeBase } from "native-base"
import { useTheme } from "../../../../theme/ThemeProvider" 
import { useResponsiveValues } from "./Card"

// Additional card components to enhance the Card system

interface CardDividerProps {
  style?: any
}

export const CardDivider: React.FC<CardDividerProps> = ({ style }) => {
  const { isDarkMode } = useTheme()
  const nbTheme = useNativeBase()
  
  return (
    <View 
      style={[
        styles.divider, 
        { 
          backgroundColor: isDarkMode ? nbTheme.colors.gray[700] : nbTheme.colors.gray[200]
        },
        style
      ]} 
    />
  )
}

interface CardImageProps {
  source: ImageSourcePropType
  style?: any
  height?: number | string
  aspectRatio?: number
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'
}

export const CardImage: React.FC<CardImageProps> = ({ 
  source, 
  style, 
  height, 
  aspectRatio = 16/9, 
  resizeMode = 'cover' 
}) => {
  const responsive = useResponsiveValues()
  
  return (
    <Image 
      source={source}
      resizeMode={resizeMode}
      style={[
        styles.image,
        {
          height: height || (responsive.isSmallScreen ? 180 : 220),
          aspectRatio: aspectRatio,
        },
        style
      ]}
      accessibilityRole="image"
    />
  )
}

interface CardButtonProps {
  onPress: () => void
  title: string
  style?: any
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const CardButton: React.FC<CardButtonProps> = ({ 
  onPress,
  title,
  style,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left'
}) => {
  const { isDarkMode, colors } = useTheme()
  const nbTheme = useNativeBase()
  const [isPressed, setIsPressed] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  // Style variants
  const getVariantStyle = () => {
    switch(variant) {
      case 'primary':
        return {
          backgroundColor: disabled 
            ? (isDarkMode ? nbTheme.colors.gray[600] : nbTheme.colors.gray[300]) 
            : colors.primary,
          borderWidth: 0,
          color: 'white',
        }
      case 'secondary':
        return {
          backgroundColor: disabled 
            ? (isDarkMode ? nbTheme.colors.gray[600] : nbTheme.colors.gray[300]) 
            : colors.secondary,
          borderWidth: 0,
          color: 'white',
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled 
            ? (isDarkMode ? nbTheme.colors.gray[600] : nbTheme.colors.gray[300]) 
            : colors.primary,
          color: disabled 
            ? (isDarkMode ? nbTheme.colors.gray[500] : nbTheme.colors.gray[400]) 
            : colors.primary,
        }
      case 'ghost':
        return {
          backgroundColor: isHovered || isPressed 
            ? (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') 
            : 'transparent',
          borderWidth: 0,
          color: disabled 
            ? (isDarkMode ? nbTheme.colors.gray[500] : nbTheme.colors.gray[400]) 
            : colors.primary,
        }
    }
  }

  // Web hover event handlers
  const webEventHandlers = Platform.OS === 'web' ? {
    onMouseEnter: () => !disabled && setIsHovered(true),
    onMouseLeave: () => !disabled && setIsHovered(false),
  } : {}

  const variantStyle = getVariantStyle()

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => !disabled && setIsPressed(true)}
      onPressOut={() => !disabled && setIsPressed(false)}
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderWidth: variantStyle.borderWidth,
          borderColor: variantStyle.borderColor,
          opacity: isPressed && !disabled ? 0.8 : 1,
          transform: isPressed && !disabled ? [{ scale: 0.98 }] : [],
          cursor: disabled ? 'not-allowed' : 'pointer',
        },
        style
      ]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      {...webEventHandlers}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          {/* Simple loading indicator */}
          <View style={[styles.loadingDot, { backgroundColor: variantStyle.color }]} />
        </View>
      ) : (
        <View style={[styles.buttonContent, { flexDirection: iconPosition === 'left' ? 'row' : 'row-reverse' }]}>
          {icon && <View style={iconPosition === 'left' ? styles.leftIcon : styles.rightIcon}>{icon}</View>}
          <Text style={[styles.buttonText, { color: variantStyle.color }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  )
}

interface CardBadgeProps {
  text: string
  style?: any
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'small' | 'medium' | 'large'
}

export const CardBadge: React.FC<CardBadgeProps> = ({ 
  text,
  style,
  variant = 'primary',
  size = 'medium'
}) => {
  const { isDarkMode, colors } = useTheme()
  const responsive = useResponsiveValues()
  
  // Color variants
  const getVariantStyle = () => {
    switch(variant) {
      case 'primary':
        return {
          backgroundColor: isDarkMode ? colors.primaryDark : colors.primary,
          color: 'white',
        }
      case 'secondary':
        return {
          backgroundColor: isDarkMode ? colors.secondaryDark : colors.secondary,
          color: 'white',
        }
      case 'success':
        return {
          backgroundColor: isDarkMode ? '#00694b' : '#4CAF50',
          color: 'white',
        }
      case 'warning':
        return {
          backgroundColor: isDarkMode ? '#8c5600' : '#FF9800',
          color: isDarkMode ? 'white' : '#000',
        }
      case 'error':
        return {
          backgroundColor: isDarkMode ? '#912018' : '#F44336',
          color: 'white',
        }
      case 'info':
        return {
          backgroundColor: isDarkMode ? '#01579b' : '#2196F3',
          color: 'white',
        }
      default:
        return {
          backgroundColor: isDarkMode ? colors.primaryDark : colors.primary,
          color: 'white',
        }
    }
  }
  
  // Size variants
  const getSizeStyle = () => {
    switch(size) {
      case 'small':
        return {
          paddingVertical: responsive.isSmallScreen ? 2 : 3,
          paddingHorizontal: responsive.isSmallScreen ? 6 : 8,
          borderRadius: 4,
          fontSize: responsive.isSmallScreen ? 10 : 11,
        }
      case 'medium':
        return {
          paddingVertical: responsive.isSmallScreen ? 3 : 4,
          paddingHorizontal: responsive.isSmallScreen ? 8 : 10,
          borderRadius: 6,
          fontSize: responsive.isSmallScreen ? 12 : 13,
        }
      case 'large':
        return {
          paddingVertical: responsive.isSmallScreen ? 4 : 5,
          paddingHorizontal: responsive.isSmallScreen ? 10 : 12,
          borderRadius: 8,
          fontSize: responsive.isSmallScreen ? 14 : 15,
        }
      default:
        return {
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 6,
          fontSize: 13,
        }
    }
  }
  
  const variantStyle = getVariantStyle()
  const sizeStyle = getSizeStyle()
  
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.backgroundColor,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.borderRadius,
        },
        style
      ]}
      accessibilityRole="text"
    >
      <Text 
        style={[
          styles.badgeText, 
          { 
            color: variantStyle.color,
            fontSize: sizeStyle.fontSize,
          }
        ]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  )
}

// Utility component for grids in cards
interface CardGridProps {
  children: React.ReactNode
  columns?: number | { small: number, medium: number, large: number }
  spacing?: number
  style?: any
}

export const CardGrid: React.FC<CardGridProps> = ({ 
  children,
  columns = { small: 1, medium: 2, large: 3 },
  spacing = 16,
  style
}) => {
  const responsive = useResponsiveValues()
  
  // Determine number of columns based on screen size
  const getColumnsCount = () => {
    if (typeof columns === 'number') {
      return columns
    }
    
    if (responsive.isSmallScreen) {
      return columns.small
    } else if (responsive.isMediumScreen) {
      return columns.medium
    } else {
      return columns.large
    }
  }
  
  const columnsCount = getColumnsCount()
  
  return (
    <View 
      style={[
        styles.grid,
        {
          gap: spacing,
          gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
        },
        style
      ]}
    >
      {children}
    </View>
  )
}

// Component for displaying individual items in a CardGrid
interface CardGridItemProps {
  children: React.ReactNode
  style?: any
}

export const CardGridItem: React.FC<CardGridItemProps> = ({ children, style }) => {
  return <View style={[styles.gridItem, style]}>{children}</View>
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
  image: {
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  button: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 2,
    opacity: 0.7,
  },
  badge: {
    alignSelf: 'flex-start',
    marginVertical: 2,
  },
  badgeText: {
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -4, // Compensate for item margins
    ...(Platform.OS === 'web' && {
      display: 'grid',
    }),
  },
  gridItem: {
    ...(Platform.OS !== 'web' && {
      flex: 1,
      margin: 4,
      minWidth: 150, // Ensure items have reasonable width on mobile
    }),
  },
});
