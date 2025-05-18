"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, Pressable, Modal, FlatList, Platform } from "react-native"
import { useTheme } from "native-base"
import { Ionicons } from "@expo/vector-icons"

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  isDisabled?: boolean
  style?: any
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  label,
  error,
  isDisabled = false,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  const theme = useTheme()

  const selectedOption = options.find((option) => option.value === value)

  const openModal = () => {
    if (!isDisabled) {
      setModalVisible(true)
    }
  }

  const closeModal = () => {
    setModalVisible(false)
  }

  const handleSelect = (option: SelectOption) => {
    onValueChange(option.value)
    closeModal()
  }

  // For web, we'll use a native select element
  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, style]}>
        {label && <Text style={[styles.label, { color: theme.colors.gray[700] }]}>{label}</Text>}
        <View
          style={[
            styles.selectContainer,
            {
              borderColor: error ? theme.colors.red[500] : theme.colors.gray[300],
              opacity: isDisabled ? 0.5 : 1,
            },
          ]}
        >
          <select
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            disabled={isDisabled}
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
            }}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </View>
        {error && <Text style={[styles.error, { color: theme.colors.red[500] }]}>{error}</Text>}
      </View>
    )
  }

  // For mobile, we'll use a custom modal
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: theme.colors.gray[700] }]}>{label}</Text>}
      <Pressable
        onPress={openModal}
        style={[
          styles.selectContainer,
          {
            borderColor: error ? theme.colors.red[500] : theme.colors.gray[300],
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.selectText,
            {
              color: selectedOption ? theme.colors.gray[900] : theme.colors.gray[400],
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.gray[500]} />
      </Pressable>
      {error && <Text style={[styles.error, { color: theme.colors.red[500] }]}>{error}</Text>}

      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
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
              <Text style={styles.modalTitle}>{label || "Select an option"}</Text>
              <Pressable onPress={closeModal}>
                <Ionicons name="close" size={24} color={theme.colors.gray[500]} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: item.value === value ? theme.colors.primary[50] : "transparent",
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: item.value === value ? theme.colors.primary[500] : theme.colors.gray[800],
                        fontWeight: item.value === value ? "600" : "normal",
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && <Ionicons name="checkmark" size={20} color={theme.colors.primary[500]} />}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
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
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  selectText: {
    fontSize: 16,
  },
  error: {
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
    maxHeight: "70%",
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
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  optionText: {
    fontSize: 16,
  },
})
