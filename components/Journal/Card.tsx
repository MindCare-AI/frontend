import type React from "react"
import { View, StyleSheet, type ViewStyle, TouchableOpacity, type TouchableOpacityProps } from "react-native"
import { colors, borderRadius, shadows } from "./theme"

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode
  style?: ViewStyle
  color?: string
  onPress?: () => void
  onLongPress?: () => void
}

export function Card({ children, style, color, onPress, onLongPress, ...rest }: CardProps) {
  const cardContent = <View style={[styles.card, color ? { backgroundColor: color } : {}, style]}>{children}</View>

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} onLongPress={onLongPress} {...rest}>
        {cardContent}
      </TouchableOpacity>
    )
  }

  return cardContent
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: 16,
    ...shadows.md,
  },
})
