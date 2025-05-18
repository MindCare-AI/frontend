"use client"

import type React from "react"
import { View, StyleSheet } from "react-native"
import { useTheme } from "native-base"

interface DividerProps {
  orientation?: "horizontal" | "vertical"
  thickness?: number
  style?: any
}

export const Divider: React.FC<DividerProps> = ({ orientation = "horizontal", thickness = 1, style }) => {
  const theme = useTheme()

  return (
    <View
      style={[
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        {
          backgroundColor: theme.colors.gray[200],
          [orientation === "horizontal" ? "height" : "width"]: thickness,
        },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  horizontal: {
    width: "100%",
    marginVertical: 8,
  },
  vertical: {
    height: "100%",
    marginHorizontal: 8,
  },
})
