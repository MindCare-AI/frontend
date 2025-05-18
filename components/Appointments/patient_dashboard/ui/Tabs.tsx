"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { View, Text, Pressable, StyleSheet, ScrollView, Animated, Dimensions, Platform } from "react-native"
import { useTheme } from "native-base"

interface TabsProps {
  tabs: { key: string; title: string }[]
  initialTab?: string
  onChange?: (key: string) => void
  style?: any
}

export const Tabs: React.FC<TabsProps> = ({ tabs, initialTab, onChange, style }) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.key || "")
  const [tabLayouts, setTabLayouts] = useState<{ [key: string]: { x: number; width: number } }>({})
  const theme = useTheme()
  const scrollViewRef = useRef<ScrollView>(null)
  const indicatorAnim = useRef(new Animated.Value(0)).current
  const { width: screenWidth } = Dimensions.get('window')
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (tabLayouts[activeTab]) {
      Animated.spring(indicatorAnim, {
        toValue: tabLayouts[activeTab].x,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start()

      // Scroll to active tab if it's not fully visible
      scrollViewRef.current?.scrollTo({
        x: Math.max(0, tabLayouts[activeTab].x - screenWidth / 2 + tabLayouts[activeTab].width / 2),
        animated: true,
      })
    }
  }, [activeTab, tabLayouts])

  const handleTabPress = (key: string) => {
    // Scale animation on press
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
    ]).start()

    setActiveTab(key)
    if (onChange) {
      onChange(key)
    }
  }

  const handleTabLayout = (key: string, event: any) => {
    const { x, width } = event.nativeEvent.layout
    setTabLayouts(prev => ({
      ...prev,
      [key]: { x, width }
    }))
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContentContainer}
      >
        <View style={styles.tabsRow}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              onLayout={(event) => handleTabLayout(tab.key, event)}
              style={({ pressed }) => [
                styles.tab,
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: activeTab === tab.key ? theme.colors.primary[50] : 'transparent',
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab.key }}
            >
              <Animated.View
                style={[
                  styles.tabInner,
                  {
                    transform: [{ scale: activeTab === tab.key ? scaleAnim : 1 }],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === tab.key ? theme.colors.primary[500] : theme.colors.gray[500],
                      fontWeight: activeTab === tab.key ? "600" : "500",
                    },
                  ]}
                >
                  {tab.title}
                </Text>
              </Animated.View>
            </Pressable>
          ))}
        </View>
        {Object.keys(tabLayouts).length > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: theme.colors.primary[500],
                transform: [{ translateX: indicatorAnim }],
                width: tabLayouts[activeTab]?.width || 0,
              },
            ]}
          />
        )}
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
  return <View style={[styles.tabContent, style, { flex: 1 }]}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabsContainer: {
    maxHeight: 56,
    borderBottomWidth: 0,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignSelf: 'center',
    paddingHorizontal: 8,
  },
  tabsContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: "row",
    position: "relative",
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  indicator: {
    position: "absolute",
    bottom: 4,
    left: 0,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3182CE',
    shadowColor: '#3182CE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
  tabContent: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 0,
    width: '100%',
    alignSelf: 'center',
  },
})
