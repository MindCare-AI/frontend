"use client"

import type React from "react"
import { useState, useRef } from "react"
import { View, StyleSheet, Animated, PanResponder, ActivityIndicator, Text } from "react-native"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  refreshHeight?: number
  maxPullHeight?: number
  backgroundColor?: string
  indicatorColor?: string
  textColor?: string
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  refreshHeight = 80,
  maxPullHeight = 120,
  backgroundColor = "white",
  indicatorColor = "#3B82F6",
  textColor = "#666",
}) => {
  const [refreshing, setRefreshing] = useState(false)
  const [pullHeight, setPullHeight] = useState(0)
  const [showPullIndicator, setShowPullIndicator] = useState(false)
  const scrollY = useRef(new Animated.Value(0)).current
  const isRefreshingRef = useRef(false)

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Use type assertion to safely access the current value
        const scrollValue = (scrollY as any)._value;
        return !isRefreshingRef.current && gestureState.dy > 0 && scrollValue === 0
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Apply resistance to the pull
          const newHeight = Math.min(maxPullHeight, gestureState.dy * 0.5)
          setPullHeight(newHeight)
          setShowPullIndicator(true)
        }
      },
      onPanResponderRelease: async () => {
        if (pullHeight >= refreshHeight) {
          try {
            isRefreshingRef.current = true
            setRefreshing(true)
            await onRefresh()
          } finally {
            isRefreshingRef.current = false
            setRefreshing(false)
            setPullHeight(0)
            setShowPullIndicator(false)
          }
        } else {
          setPullHeight(0)
          setShowPullIndicator(false)
        }
      },
    }),
  ).current

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
  })

  return (
    <View style={[styles.container, { backgroundColor }]} {...panResponder.panHandlers}>
      {showPullIndicator && (
        <Animated.View
          style={[
            styles.refreshContainer,
            {
              height: pullHeight,
              opacity: pullHeight / refreshHeight,
            },
          ]}
        >
          {refreshing ? (
            <ActivityIndicator color={indicatorColor} size="small" />
          ) : (
            <Text style={[styles.pullText, { color: textColor }]}>
              {pullHeight >= refreshHeight ? "Release to refresh" : "Pull down to refresh"}
            </Text>
          )}
        </Animated.View>
      )}
      <Animated.View
        style={{
          transform: [{ translateY: pullHeight }],
          flex: 1,
        }}
      >
        <Animated.ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollViewContent}
        >
          {children}
        </Animated.ScrollView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  refreshContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },
  pullText: {
    fontSize: 14,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
})
