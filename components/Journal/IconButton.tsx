import type React from "react"
import { TouchableOpacity, StyleSheet, type ViewStyle, type TouchableOpacityProps } from "react-native"
import { colors } from "./theme"

interface IconButtonProps extends TouchableOpacityProps {
  icon: React.ReactNode
  size?: number
  color?: string
  style?: ViewStyle
}

export function IconButton({ icon, size = 24, color = colors.primary, style, ...rest }: IconButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, { padding: size / 3 }, style]} activeOpacity={0.7} {...rest}>
      {icon}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
  },
})
