"use client"

import type React from "react"
import { Pressable, View, Text, StyleSheet } from "react-native"
import { useTheme } from "native-base"
import { Ionicons } from "@expo/vector-icons"

interface CheckboxProps {
  isChecked: boolean
  onChange: (isChecked: boolean) => void
  children?: React.ReactNode
  value?: string
  isDisabled?: boolean
  style?: any
}

export const Checkbox: React.FC<CheckboxProps> = ({
  isChecked,
  onChange,
  children,
  value,
  isDisabled = false,
  style,
}) => {
  const theme = useTheme()

  const handlePress = () => {
    if (!isDisabled) {
      onChange(!isChecked)
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          opacity: isDisabled ? 0.5 : pressed ? 0.7 : 1,
        },
        style,
      ]}
      disabled={isDisabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked, disabled: isDisabled }}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: isChecked ? theme.colors.primary[500] : theme.colors.gray[300],
            backgroundColor: isChecked ? theme.colors.primary[500] : "transparent",
          },
        ]}
      >
        {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
      {children && <Text style={[styles.label, { color: theme.colors.primary[600] }]}>{children}</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
  },
})
