"use client"
import { TouchableOpacity, Text, StyleSheet, type ViewStyle, type TextStyle, Platform, Pressable } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../../contexts/ThemeContext"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "default" | "outline" | "destructive"
  size?: "default" | "sm" | "lg"
  icon?: keyof typeof Feather.glyphMap
  primary?: boolean
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  disabled?: boolean
}

export default function Button({
  title,
  onPress,
  variant = "default",
  size = "default",
  icon,
  primary = false,
  fullWidth = false,
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const { colors } = useTheme()

  // Override variant if primary is true
  const buttonVariant = primary ? "default" : variant

  const getButtonStyle = () => {
    const baseStyle: ViewStyle[] = [styles.button]

    // Add size styles
    switch (size) {
      case "sm":
        baseStyle.push(styles.buttonSm)
        break
      case "lg":
        baseStyle.push(styles.buttonLg)
        break
      default:
        baseStyle.push(styles.buttonDefault)
    }

    // Add variant styles
    switch (buttonVariant) {
      case "outline":
        baseStyle.push({
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.primary,
        })
        break
      case "destructive":
        baseStyle.push({ backgroundColor: colors.danger })
        break
      default:
        baseStyle.push({ backgroundColor: colors.primary })
    }

    // Add full width style
    if (fullWidth) {
      baseStyle.push(styles.buttonFullWidth)
    }

    // Add disabled style
    if (disabled) {
      baseStyle.push(styles.buttonDisabled)
    }

    return baseStyle
  }

  const getTextStyle = () => {
    const baseStyle: TextStyle[] = [styles.buttonText]

    // Add size styles
    switch (size) {
      case "sm":
        baseStyle.push(styles.buttonTextSm)
        break
      case "lg":
        baseStyle.push(styles.buttonTextLg)
        break
      default:
        baseStyle.push(styles.buttonTextDefault)
    }

    // Add variant styles
    switch (buttonVariant) {
      case "outline":
        baseStyle.push({ color: colors.primary })
        break
      case "destructive":
        baseStyle.push({ color: "white" })
        break
      default:
        baseStyle.push({ color: "white" })
    }

    // Add disabled style
    if (disabled) {
      baseStyle.push(styles.buttonTextDisabled)
    }

    return baseStyle
  }

  // Use Pressable for web to get better hover states
  if (Platform.OS === "web") {
    return (
      <Pressable
        style={({ pressed }) => [
          ...getButtonStyle(),
          pressed && styles.buttonPressed,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        {icon && (
          <Feather
            name={icon}
            size={size === "sm" ? 14 : 16}
            color={buttonVariant === "outline" ? colors.primary : "white"}
            style={styles.icon}
          />
        )}
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      </Pressable>
    )
  }

  // Use TouchableOpacity for native
  return (
    <TouchableOpacity style={[...getButtonStyle(), style]} onPress={onPress} disabled={disabled} activeOpacity={0.7}>
      {icon && (
        <Feather
          name={icon}
          size={size === "sm" ? 14 : 16}
          color={buttonVariant === "outline" ? colors.primary : "white"}
          style={styles.icon}
        />
      )}
      <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      },
    }),
  },
  buttonDefault: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonLg: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonFullWidth: {
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonHovered: {
    opacity: 0.9,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontWeight: "500",
    textAlign: "center",
  },
  buttonTextDefault: {
    fontSize: 14,
  },
  buttonTextSm: {
    fontSize: 12,
  },
  buttonTextLg: {
    fontSize: 16,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
  icon: {
    marginRight: 8,
  },
})
