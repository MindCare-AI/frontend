import type React from "react"
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  type ViewStyle,
  type TextStyle,
} from "react-native"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
  accessibilityLabel?: string
  testID?: string
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  accessibilityLabel,
  testID,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "outline":
        return styles.outline
      case "ghost":
        return styles.ghost
      case "link":
        return styles.link
      default:
        return styles.default
    }
  }

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case "outline":
      case "ghost":
      case "link":
        return styles.textAlternate
      default:
        return styles.textDefault
    }
  }

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "sm":
        return styles.small
      case "lg":
        return styles.large
      default:
        return styles.medium
    }
  }

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case "sm":
        return styles.textSmall
      case "lg":
        return styles.textLarge
      default:
        return styles.textMedium
    }
  }

  const webStyles: ViewStyle = Platform.OS === "web" ? { cursor: disabled ? "not-allowed" : "pointer" } as ViewStyle : {}

  return (
    <TouchableOpacity
      style={[styles.button, getVariantStyle(), getSizeStyle(), disabled && styles.disabled, webStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variant === "default" ? "white" : "#3B82F6"} size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[getTextStyle(), getTextSizeStyle(), disabled && styles.textDisabled, textStyle]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}

import { View } from "react-native"

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    minHeight: 44, // Improved touch target
  },
  default: {
    backgroundColor: "#3B82F6",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  link: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 0,
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  large: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  textDefault: {
    color: "white",
    fontWeight: "600",
  },
  textAlternate: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  textDisabled: {
    opacity: 0.7,
  },
  iconContainer: {
    marginRight: 8,
  },
})
