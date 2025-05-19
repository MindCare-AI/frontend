import type React from "react"
import { View, Text, StyleSheet } from "react-native"

interface BadgeProps {
  count: number
  variant?: "default" | "outline"
  style?: any
  textStyle?: any
  testID?: string
}

export const Badge: React.FC<BadgeProps> = ({ count, variant = "default", style, textStyle, testID }) => {
  if (count <= 0) return null

  return (
    <View
      style={[styles.badge, variant === "outline" ? styles.outline : styles.default, style]}
      testID={testID}
      accessibilityLabel={`${count} new items`}
    >
      <Text style={[styles.text, variant === "outline" ? styles.outlineText : styles.defaultText, textStyle]}>
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  default: {
    backgroundColor: "#3B82F6",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
  },
  defaultText: {
    color: "white",
  },
  outlineText: {
    color: "#3B82F6",
  },
})
