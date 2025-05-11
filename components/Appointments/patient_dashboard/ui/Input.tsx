"use client"

import type React from "react"
import { TextInput, View, Text, StyleSheet, Platform, Animated, AccessibilityInfo } from "react-native"
import { useTheme } from "native-base"
import { useEffect, useRef, useState } from "react"

interface InputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
  error?: string
  secureTextEntry?: boolean
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad"
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  autoCorrect?: boolean
  multiline?: boolean
  numberOfLines?: number
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  style?: any
  inputStyle?: any
  required?: boolean
  disabled?: boolean
  helperText?: string
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  required = false,
  disabled = false,
  helperText,
}) => {
  const theme = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false)

  useEffect(() => {
    const checkScreenReader = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled()
      setIsScreenReaderEnabled(isEnabled)
    }
    checkScreenReader()
  }, [])

  useEffect(() => {
    Animated.timing(labelAnimation, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [isFocused, value])

  const labelStyle = {
    transform: [{
      translateY: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -25],
      }),
    }],
    fontSize: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: error 
      ? theme.colors.red[500]
      : isFocused 
        ? theme.colors.primary[500]
        : theme.colors.gray[600],
  }

  const getBorderColor = () => {
    if (error) return theme.colors.red[500]
    if (isFocused) return theme.colors.primary[500]
    if (disabled) return theme.colors.gray[300]
    return theme.colors.gray[300]
  }

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: disabled ? theme.colors.gray[100] : "white",
            minHeight: multiline ? 100 : undefined,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <View style={styles.inputWrapper}>
          {label && (
            <Animated.Text
              style={[styles.label, labelStyle]}
              accessibilityRole="text"
            >
              {label}{required && " *"}
            </Animated.Text>
          )}
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.gray[900],
                paddingLeft: leftIcon ? 0 : 12,
                paddingRight: rightIcon ? 0 : 12,
                textAlignVertical: multiline ? "top" : "center",
                opacity: disabled ? 0.7 : 1,
              },
              inputStyle,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={!label ? placeholder : isFocused ? placeholder : ""}
            placeholderTextColor={theme.colors.gray[400]}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : undefined}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            editable={!disabled}
            accessibilityLabel={label}
            accessibilityHint={helperText}
            accessibilityState={{ disabled }}
            importantForAccessibility={required ? "yes" : "no"}
          />
        </View>
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      {(error || helperText) && (
        <Text 
          style={[
            styles.helperText,
            { color: error ? theme.colors.red[500] : theme.colors.gray[600] }
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: "white",
    overflow: "hidden",
    position: "relative",
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
  },
  label: {
    position: "absolute",
    left: 12,
    top: 12,
    backgroundColor: "transparent",
    zIndex: 1,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    height: 40,
    paddingVertical: 8,
    fontSize: 16,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  iconContainer: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
})
