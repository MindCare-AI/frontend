"use client"

import React from "react"
import { Text, StyleSheet, Animated } from "react-native"
import { useNetworkStatus } from "../../hooks/MessagingScreen/useNetworkStatus"

export const NetworkStatusBar: React.FC = () => {
  const { isOffline } = useNetworkStatus()
  const [visible, setVisible] = React.useState(false)
  const slideAnim = React.useRef(new Animated.Value(-50)).current

  React.useEffect(() => {
    if (isOffline) {
      setVisible(true)
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else if (visible) {
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false)
      })
    }
  }, [isOffline])

  if (!visible) return null

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#EF4444",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
})
