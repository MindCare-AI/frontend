import type React from "react"
import { TouchableOpacity, StyleSheet, Platform, type ViewStyle } from "react-native"

interface IconButtonProps {
  icon: React.ReactNode
  onPress: () => void
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  style?: ViewStyle
  accessibilityLabel: string
  testID?: string
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = "default",
  size = "md",
  disabled = false,
  style,
  accessibilityLabel,
  testID,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "outline":
        return styles.outline
      case "ghost":
        return styles.ghost
      default:
        return styles.default
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

  const webStyles: ViewStyle = Platform.OS === "web" ? { cursor: disabled ? "not-allowed" : "pointer" } as any : {}

  return (
    <TouchableOpacity
      style={[styles.button, getVariantStyle(), getSizeStyle(), disabled && styles.disabled, webStyles, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {icon}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
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
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 44, // Improved touch target
    height: 44, // Improved touch target
  },
  large: {
    width: 48,
    height: 48,
  },
  disabled: {
    opacity: 0.5,
  },
})
