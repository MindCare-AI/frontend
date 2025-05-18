import { View, TextInput, Text, StyleSheet, type TextInputProps, type ViewStyle } from "react-native"
import { colors, spacing, borderRadius, fontSizes } from "./theme"

interface TextAreaProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
  height?: number
}

export function TextArea({ label, error, containerStyle, style, height = 150, ...rest }: TextAreaProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, { height }, error ? styles.inputError : {}, style]}
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
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: colors.black,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
})
