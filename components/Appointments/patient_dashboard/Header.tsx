"use client"

import type React from "react"
import { View, Text, Pressable, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme as useNativeBase } from "native-base"
import { useTheme } from "../../../theme/ThemeProvider"
import { ThemeToggle } from "./ui"
import { useBreakpointValue } from "native-base"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const Header: React.FC = () => {
  const navigation = useNavigation()
  const nbTheme = useNativeBase()
  const { isDarkMode, colors } = useTheme()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        backgroundColor: isDarkMode ? colors.card.dark : "white",
        paddingTop: insets.top,
        paddingHorizontal: useBreakpointValue({ base: 16, md: 32 }),
        paddingBottom: useBreakpointValue({ base: 12, md: 20 }),
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? nbTheme.colors.gray[700] : "#E2E8F0",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo and Title Section */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../../assets/images/logo_mindcare.svg")}
            style={{
              width: useBreakpointValue({ base: 32, md: 40 }),
              height: useBreakpointValue({ base: 32, md: 40 }),
              marginRight: 8,
            }}
            resizeMode="contain"
          />
          <Text 
            style={{ 
              fontSize: useBreakpointValue({ base: 18, md: 20 }), 
              fontWeight: "bold", 
              color: nbTheme.colors.primary[500] 
            }}
          >
            My Appointments
          </Text>
        </View>

        {/* Navigation and Actions Section */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {!isMobile && (
            <>
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
                onPress={() => navigation.navigate("Settings")}
              />
            </>
          )}

          {/* Theme Toggle */}
          <View style={{ marginLeft: isMobile ? 8 : 16 }}>
            <ThemeToggle />
          </View>

          {/* Avatar */}
          <Pressable
            onPress={() => navigation.navigate("Profile" as never)}
            style={{
              marginLeft: 16,
              width: useBreakpointValue({ base: 32, md: 40 }),
              height: useBreakpointValue({ base: 32, md: 40 }),
              borderRadius: 20,
              backgroundColor: nbTheme.colors.primary[100],
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="person" size={20} color={nbTheme.colors.primary[500]} />
          </Pressable>

          {/* Mobile Menu Button */}
          {isMobile && (
            <Pressable
              onPress={() => {
                // Add mobile menu handler
              }}
              style={{ padding: 8, marginLeft: 8 }}
            >
              <Ionicons name="menu" size={24} color={nbTheme.colors.primary[500]} />
            </Pressable>
          )}
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
