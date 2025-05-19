import type React from "react"
import { View, Image, Text, StyleSheet, Platform } from "react-native"

interface AvatarProps {
  source?: string
  name: string
  size?: number
  online?: boolean
  style?: any
  testID?: string
}

export const Avatar: React.FC<AvatarProps> = ({ source, name, size = 40, online, style, testID }) => {
  const initial = name.charAt(0).toUpperCase()

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
        Platform.OS === "web" ? styles.webContainer : null,
      ]}
      testID={testID}
      accessibilityLabel={`Avatar for ${name}`}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={styles.image}
          accessibilityLabel={`${name}'s avatar`}
          onError={(e) => console.log("Avatar image loading error:", e.nativeEvent.error)}
        />
      ) : (
        <View style={[styles.fallback, { backgroundColor: getColorFromName(name) }]}>
          <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
        </View>
      )}
      {online && <View style={[styles.onlineIndicator, { width: size * 0.25, height: size * 0.25 }]} />}
    </View>
  )
}

// Generate a consistent color based on name
const getColorFromName = (name: string): string => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 70%, 60%)`
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  webContainer: {
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  fallback: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    color: "white",
    fontWeight: "bold",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 999,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
})
