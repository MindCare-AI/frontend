"use client"

import type React from "react"
import { View, Text, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme as useNativeBase } from "native-base"
import { useTheme } from "../../../theme/ThemeProvider"
import { ThemeToggle } from "./ui"

const Header: React.FC = () => {
  const navigation = useNavigation()
  const nbTheme = useNativeBase()
  const { isDarkMode, colors } = useTheme()

  return (
    <View
      style={{
        backgroundColor: isDarkMode ? colors.card.dark : "white",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? nbTheme.colors.gray[700] : "#E2E8F0",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", color: nbTheme.colors.primary[500] }}>My Appointments</Text>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <NavItem
          icon="home-outline"
          label="Dashboard"
          isActive={false}
          onPress={() => navigation.navigate("Dashboard" as never)}
        />
        <NavItem icon="calendar-outline" label="Appointments" isActive={true} onPress={() => {}} />
        <NavItem
          icon="person-outline"
          label="Profile"
          isActive={false}
          onPress={() => navigation.navigate("Profile" as never)}
        />
        <NavItem
          icon="settings-outline"
          label="Settings"
          isActive={false}
          onPress={() => navigation.navigate("Settings" as never)}
        />
        <View style={{ marginLeft: 16 }}>
          <ThemeToggle />
        </View>
      </View>
    </View>
  )
}

type NavItemProps = {
  icon: string
  label: string
  isActive: boolean
  onPress: () => void
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onPress }) => {
  const nbTheme = useNativeBase()
  const { isDarkMode } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 24,
      }}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={isActive ? nbTheme.colors.primary[500] : isDarkMode ? "#A0AEC0" : "#718096"}
        style={{ marginRight: 4 }}
      />
      <Text
        style={{
          color: isActive ? nbTheme.colors.primary[500] : isDarkMode ? "#A0AEC0" : "#718096",
          fontWeight: isActive ? "500" : "normal",
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export default Header
