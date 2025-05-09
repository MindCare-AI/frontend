"use client"

import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  type ViewStyle,
  Platform,
  Pressable,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../../contexts/ThemeContext"

interface DropdownItem {
  label: string
  value: string
}

interface DropdownProps {
  placeholder: string
  items: DropdownItem[]
  selectedValue: string | null
  onValueChange: (value: string) => void
  style?: ViewStyle
}

export default function Dropdown({ placeholder, items, selectedValue, onValueChange, style }: DropdownProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { colors } = useTheme()

  const selectedItem = items.find((item) => item.value === selectedValue)

  // Web-specific dropdown implementation
  if (Platform.OS === "web") {
    return (
      <View style={[styles.webDropdownContainer, style]}>
        <Pressable
          style={[
            styles.webDropdown,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            },
            { borderColor: colors.primary },
          ]}
          onPress={() => setIsOpen(!isOpen)}
        >
          <Text
            style={[
              styles.dropdownText,
              !selectedItem && { color: colors.secondary },
              selectedItem && { color: colors.text },
            ]}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </Text>
          <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.secondary} />
        </Pressable>

        {isOpen && (
          <View
            style={[
              styles.webDropdownMenu,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {items.map((item) => (
              <Pressable
                key={item.value}
                style={[
                  styles.webDropdownItem,
                  selectedValue === item.value && { backgroundColor: colors.background },
                  { backgroundColor: colors.background },
                ]}
                onPress={() => {
                  onValueChange(item.value)
                  setIsOpen(false)
                }}
              >
                <Text
                  style={[
                    styles.webDropdownItemText,
                    { color: colors.text },
                    selectedValue === item.value && { color: colors.primary, fontWeight: "500" },
                  ]}
                >
                  {item.label}
                </Text>
                {selectedValue === item.value && <Feather name="check" size={16} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    )
  }

  // Native mobile implementation with modal
  return (
    <>
      <TouchableOpacity
        style={[
          styles.dropdown,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
          style,
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedItem && { color: colors.secondary },
            selectedItem && { color: colors.text },
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.secondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    { borderBottomColor: colors.border },
                    selectedValue === item.value && { backgroundColor: colors.background },
                  ]}
                  onPress={() => {
                    onValueChange(item.value)
                    setModalVisible(false)
                  }}
                >
                  <Text
                    style={[
                      styles.itemText,
                      { color: colors.text },
                      selectedValue === item.value && { color: colors.primary, fontWeight: "500" },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.value && <Feather name="check" size={16} color={colors.primary} />}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: Platform.OS === "ios" ? 40 : 16,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
  },
  // Web-specific styles
  webDropdownContainer: {
    position: "relative",
  },
  webDropdown: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  webDropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 10,
    maxHeight: 200,
    overflow: "scroll", // Changed from 'auto' to 'scroll'
  },
  webDropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    cursor: "pointer",
  },
  webDropdownItemText: {
    fontSize: 14,
  },
})
