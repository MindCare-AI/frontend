"use client"

import type React from "react"
import { View, StyleSheet } from "react-native"
import { useTheme } from "../../../contexts/feeds/ThemeContext"

interface ProgressBarProps {
  progress: number // 0 to 100
  height?: number
  backgroundColor?: string
  progressColor?: string
  style?: any
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 8, backgroundColor, progressColor, style }) => {
  const { colors } = useTheme()

  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <View style={[styles.container, { height, backgroundColor: backgroundColor || colors.secondary }, style]}>
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress}%`,
            backgroundColor: progressColor || colors.primary,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
  },
})

export default ProgressBar
