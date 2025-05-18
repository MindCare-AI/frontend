"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Pressable, StyleSheet, Platform, Modal, AccessibilityInfo } from "react-native"
import { useTheme } from "native-base"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"

interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  label?: string
  placeholder?: string
  error?: string
  isDisabled?: boolean
  minimumDate?: Date
  maximumDate?: Date
  style?: any
  helperText?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select a date",
  error,
  isDisabled = false,
  minimumDate,
  maximumDate,
  style,
  helperText,
}) => {
  const [showPicker, setShowPicker] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const theme = useTheme()

  const handlePress = () => {
    if (!isDisabled) {
      setShowPicker(true)
      setIsFocused(true)
    }
  }

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowPicker(false)
      setIsFocused(false)
    }

    if (selectedDate) {
      onChange(selectedDate)
      // Provide haptic feedback if available
      if (Platform.OS === "ios") {
        AccessibilityInfo.announceForAccessibility("Date selected")
      }
    }
  }

  const handleCancel = () => {
    setShowPicker(false)
    setIsFocused(false)
  }

  const handleConfirm = () => {
    setShowPicker(false)
    setIsFocused(false)
  }

  const getBorderColor = () => {
    if (error) return theme.colors.red[500]
    if (isFocused) return theme.colors.primary[500]
    return theme.colors.gray[300]
  }

  // For web, we'll use a native date input with custom styling
  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, style]}>
        {label && (
          <Text 
            style={[
              styles.label, 
              { 
                color: error ? theme.colors.red[500] : theme.colors.gray[700],
                marginBottom: 8 
              }
            ]}
          >
            {label}
          </Text>
        )}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: getBorderColor(),
              borderWidth: 2,
              opacity: isDisabled ? 0.5 : 1,
              backgroundColor: isDisabled ? theme.colors.gray[100] : "white",
            },
          ]}
        >
          <input
            type="date"
            value={value ? format(value, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              if (e.target.value) {
                onChange(new Date(e.target.value))
              } else {
                onChange(null)
              }
            }}
            disabled={isDisabled}
            min={minimumDate ? format(minimumDate, "yyyy-MM-dd") : undefined}
            max={maximumDate ? format(maximumDate, "yyyy-MM-dd") : undefined}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              backgroundColor: "transparent",
              paddingLeft: 12,
              paddingRight: 12,
              fontSize: 16,
              color: value ? theme.colors.gray[900] : theme.colors.gray[400],
              outlineStyle: "none",
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
            aria-label={label || "Date picker"}
            aria-invalid={!!error}
            aria-describedby={error ? "date-error" : helperText ? "date-helper" : undefined}
          />
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={isFocused ? theme.colors.primary[500] : theme.colors.gray[500]} 
            style={styles.icon}
          />
        </View>
        {helperText && !error && (
          <Text style={[styles.helperText, { color: theme.colors.gray[500] }]}>
            {helperText}
          </Text>
        )}
        {error && (
          <Text 
            style={[styles.error, { color: theme.colors.red[500] }]}
            id="date-error"
          >
            {error}
          </Text>
        )}
      </View>
    )
  }

  // For iOS, we'll use a modal with DateTimePicker
  if (Platform.OS === "ios") {
    return (
      <View style={[styles.container, style]}>
        {label && (
          <Text 
            style={[
              styles.label, 
              { 
                color: error ? theme.colors.red[500] : theme.colors.gray[700],
                marginBottom: 8 
              }
            ]}
          >
            {label}
          </Text>
        )}
        <Pressable
          onPress={handlePress}
          style={[
            styles.inputContainer,
            {
              borderColor: getBorderColor(),
              borderWidth: 2,
              opacity: isDisabled ? 0.5 : 1,
              backgroundColor: isDisabled ? theme.colors.gray[100] : "white",
            },
          ]}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel={label || "Date picker"}
          accessibilityState={{ disabled: isDisabled }}
        >
          <Text
            style={[
              styles.inputText,
              {
                color: value ? theme.colors.gray[900] : theme.colors.gray[400],
              },
            ]}
          >
            {value ? format(value, "MMMM d, yyyy") : placeholder}
          </Text>
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={isFocused ? theme.colors.primary[500] : theme.colors.gray[500]} 
          />
        </Pressable>
        {helperText && !error && (
          <Text style={[styles.helperText, { color: theme.colors.gray[500] }]}>
            {helperText}
          </Text>
        )}
        {error && (
          <Text style={[styles.error, { color: theme.colors.red[500] }]}>
            {error}
          </Text>
        )}

        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: theme.colors.white,
                  borderColor: theme.colors.gray[200],
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancel}
                  style={styles.modalButton}
                >
                  <Text style={{ color: theme.colors.gray[500] }}>Cancel</Text>
                </Pressable>
                <Text style={styles.modalTitle}>{label || "Select Date"}</Text>
                <Pressable 
                  onPress={handleConfirm}
                  style={styles.modalButton}
                >
                  <Text style={{ color: theme.colors.primary[500] }}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={value || new Date()}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={{ width: "100%" }}
              />
            </View>
          </View>
        </Modal>
      </View>
    )
  }

  // For Android, we'll use the native DateTimePicker
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text 
          style={[
            styles.label, 
            { 
              color: error ? theme.colors.red[500] : theme.colors.gray[700],
              marginBottom: 8 
            }
          ]}
        >
          {label}
        </Text>
      )}
      <Pressable
        onPress={handlePress}
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            borderWidth: 2,
            opacity: isDisabled ? 0.5 : 1,
            backgroundColor: isDisabled ? theme.colors.gray[100] : "white",
          },
        ]}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label || "Date picker"}
        accessibilityState={{ disabled: isDisabled }}
      >
        <Text
          style={[
            styles.inputText,
            {
              color: value ? theme.colors.gray[900] : theme.colors.gray[400],
            },
          ]}
        >
          {value ? format(value, "MMMM d, yyyy") : placeholder}
        </Text>
        <Ionicons 
          name="calendar-outline" 
          size={20} 
          color={isFocused ? theme.colors.primary[500] : theme.colors.gray[500]} 
        />
      </Pressable>
      {helperText && !error && (
        <Text style={[styles.helperText, { color: theme.colors.gray[500] }]}>
          {helperText}
        </Text>
      )}
      {error && (
        <Text style={[styles.error, { color: theme.colors.red[500] }]}>
          {error}
        </Text>
      )}

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalButton: {
    padding: 8,
  },
  icon: {
    marginLeft: 8,
  },
})
