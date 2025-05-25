import { View, TextInput, Text, StyleSheet, type TextInputProps, type ViewStyle } from "react-native"
import { colors, spacing, borderRadius, fontSizes } from "./theme"

interface TextAreaProps extends TextInputProps {
  label?: string
  error?: string
  height?: number
  containerStyle?: ViewStyle
}

export function TextArea({ label, error, height = 120, containerStyle, style, ...rest }: TextAreaProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.textArea,
          { height },
          error ? styles.textAreaError : {},
          style
        ]}
        multiline
        textAlignVertical="top"
        placeholderTextColor={colors.gray}
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    marginBottom: spacing.xs,
    color: colors.darkGray,
  },
  textArea: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: colors.black,
  },
  textAreaError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
})
