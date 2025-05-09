import type React from "react"
import { TextInput, View, Text, StyleSheet, Platform } from "react-native"
import { useTheme } from "native-base"

interface TextAreaProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
  error?: string
  numberOfLines?: number
  maxLength?: number
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  autoCorrect?: boolean
  isDisabled?: boolean
  style?: any
  inputStyle?: any
}

export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  numberOfLines = 4,
  maxLength,
  autoCapitalize = "sentences",
  autoCorrect = true,
  isDisabled = false,
  style,
  inputStyle,
}) => {
  const theme = useTheme()

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: theme.colors.gray[700] }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? theme.colors.red[500] : theme.colors.gray[300],
            height: 24 * numberOfLines + 16, // Approximate height based on line height
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.gray[900],
              height: "100%",
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray[400]}
          multiline
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={!isDisabled}
          textAlignVertical="top"
        />
      </View>
      {error && <Text style={[styles.error, { color: theme.colors.red[500] }]}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: "white",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
})
