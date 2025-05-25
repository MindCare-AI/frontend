import type React from "react"
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  type TouchableOpacityProps,
} from "react-native"
import { colors, spacing, borderRadius, fontSizes } from "./theme"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  ...rest
}: ButtonProps) {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.primary,
        }
      case "secondary":
        return {
          backgroundColor: colors.secondary,
        }
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.primary,
        }
      case "ghost":
        return {
          backgroundColor: "transparent",
        }
      case "destructive":
        return {
          backgroundColor: colors.danger,
        }
      default:
        return {}
    }
  }

  const getTextColor = (): string => {
    switch (variant) {
      case "outline":
      case "ghost":
        return colors.primary
      case "secondary":
        return colors.textPrimary // Use dark text for light secondary background
      default:
        return colors.white
    }
  }

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
        }
      case "lg":
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
        }
      default:
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
        }
    }
  }

  const getTextSize = (): number => {
    switch (size) {
      case "sm":
        return fontSizes.sm
      case "lg":
        return fontSizes.lg
      default:
        return fontSizes.md
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : typeof children === "string" ? (
        <Text style={[styles.text, { color: getTextColor(), fontSize: getTextSize() }, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
})
