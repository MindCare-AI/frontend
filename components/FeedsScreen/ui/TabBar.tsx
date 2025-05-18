"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useTheme } from "../../../contexts/feeds/ThemeContext"

interface Tab {
  key: string
  title: string
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabKey: string) => void
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            {
              borderBottomColor: activeTab === tab.key ? colors.primary : "transparent",
            },
          ]}
          onPress={() => onTabChange(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === tab.key ? colors.primary : colors.text,
                fontWeight: activeTab === tab.key ? "bold" : "normal",
              },
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginHorizontal: -16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
  },
})

export default TabBar
