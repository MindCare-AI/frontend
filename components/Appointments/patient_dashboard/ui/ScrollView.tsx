import type React from "react"
import { ScrollView as RNScrollView, StyleSheet, View } from "react-native"

interface ScrollViewProps {
  children: React.ReactNode
  height?: number | string
  maxHeight?: number | string
  showsVerticalScrollIndicator?: boolean
  showsHorizontalScrollIndicator?: boolean
  horizontal?: boolean
  style?: any
  contentContainerStyle?: any
}

export const ScrollView: React.FC<ScrollViewProps> = ({
  children,
  height,
  maxHeight,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
  horizontal = false,
  style,
  contentContainerStyle,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          height,
          maxHeight,
        },
        style,
      ]}
    >
      <RNScrollView
        horizontal={horizontal}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      >
        {children}
      </RNScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
})
