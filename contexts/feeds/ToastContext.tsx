"use client"

import type React from "react"
import { createContext, useContext, useState, useRef, useEffect } from "react"
import { Animated, StyleSheet, Text, View, Platform } from "react-native"
import { useTheme } from "./ThemeContext"

interface ToastOptions {
  title: string
  description?: string
  duration?: number
  type?: "success" | "error" | "info" | "warning"
}

interface ToastContextType {
  toast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
})

export const useToast = () => useContext(ToastContext)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false)
  const [options, setOptions] = useState<ToastOptions>({ title: "" })
  const fadeAnim = useRef(new Animated.Value(0)).current
  const { colors, isDark } = useTheme()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const toast = (newOptions: ToastOptions) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setOptions(newOptions)
    setVisible(true)

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    timeoutRef.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false)
      })
    }, newOptions.duration || 3000)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getBackgroundColor = () => {
    switch (options.type) {
      case "success":
        return colors.success
      case "error":
        return colors.danger
      case "warning":
        return colors.warning
      case "info":
      default:
        return colors.info
    }
  }

  // This is the issue! When visible is false, we're just returning children
  // instead of rendering both the children and the Animated.View (just with opacity 0)
  // Fix: Always render both the children and the toast
  return (
    <>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              backgroundColor: isDark ? colors.card : "#FFFFFF",
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.indicator, { backgroundColor: getBackgroundColor() }]} />
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{options.title}</Text>
            {options.description && (
              <Text style={[styles.description, { color: colors.muted }]}>{options.description}</Text>
            )}
          </View>
        </Animated.View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 20 : 40,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    zIndex: 9999,
  },
  indicator: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
})
