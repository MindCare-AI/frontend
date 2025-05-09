"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native"
import { useTheme } from "native-base"

interface TabsProps {
  tabs: { key: string; title: string }[]
  initialTab?: string
  onChange?: (key: string) => void
  style?: any
}

export const Tabs: React.FC<TabsProps> = ({ tabs, initialTab, onChange, style }) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.key || "")
  const theme = useTheme()

  const handleTabPress = (key: string) => {
    setActiveTab(key)
    if (onChange) {
      onChange(key)
    }
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        <View style={styles.tabsRow}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={({ pressed }) => [
                styles.tab,
                {
                  opacity: pressed ? 0.7 : 1,
                  borderBottomColor: activeTab === tab.key ? theme.colors.primary[500] : "transparent",
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab.key }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab.key ? theme.colors.primary[500] : theme.colors.gray[500],
                    fontWeight: activeTab === tab.key ? "600" : "normal",
                  },
                ]}
              >
                {tab.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

interface TabContentProps {
  tabKey: string
  activeTab: string
  children: React.ReactNode
  style?: any
}

export const TabContent: React.FC<TabContentProps> = ({ tabKey, activeTab, children, style }) => {
  if (tabKey !== activeTab) return null
  return <View style={[styles.tabContent, style]}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  tabsContainer: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  tabsRow: {
    flexDirection: "row",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
  },
  tabContent: {
    paddingTop: 16,
  },
})
