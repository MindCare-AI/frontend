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
  activeTextStyle?: { color?: string; [key: string]: any }
  indicatorStyle?: { backgroundColor?: string; [key: string]: any }
}

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  initialTab, 
  onChange, 
  style,
  activeTextStyle,
  indicatorStyle 
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.key || "")
  const [tabLayouts, setTabLayouts] = useState<{ [key: string]: { x: number; width: number } }>({})
  const theme = useTheme()
  const scrollViewRef = useRef<ScrollView>(null)
  const indicatorAnim = useRef(new Animated.Value(0)).current
  const indicatorWidthAnim = useRef(new Animated.Value(0)).current
  const { width: screenWidth } = Dimensions.get('window')
  const scaleAnim = useRef(new Animated.Value(1)).current

  // Update indicator position when tab layouts change or active tab changes
  useEffect(() => {
    if (tabLayouts[activeTab]) {
      // Animate both position and width for a more fluid effect
      Animated.parallel([
        Animated.spring(indicatorAnim, {
          toValue: tabLayouts[activeTab].x,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
        Animated.spring(indicatorWidthAnim, {
          toValue: tabLayouts[activeTab].width,
          useNativeDriver: false, // width can't use native driver
          tension: 60,
          friction: 8,
        })
      ]).start();

      // Scroll to active tab if it's not fully visible
      scrollViewRef.current?.scrollTo({
        x: Math.max(0, tabLayouts[activeTab].x - screenWidth / 3 + tabLayouts[activeTab].width / 2),
        animated: true,
      })
    }
  }, [activeTab, tabLayouts])

  const handleTabPress = (key: string) => {
    // Enhanced animation sequence
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 120,
        friction: 6,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 6,
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
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            
            return (
              <Pressable
                key={tab.key}
                onPress={() => handleTabPress(tab.key)}
                onLayout={(event) => handleTabLayout(tab.key, event)}
                style={({ pressed }) => [
                  styles.tab,
                  {
                    opacity: pressed ? 0.85 : 1,
                    backgroundColor: isActive ? theme.colors.primary[50] : 'transparent',
                  },
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Animated.View
                  style={[
                    styles.tabInner,
                    {
                      transform: [{ scale: isActive ? scaleAnim : 1 }],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isActive ? 
                          (activeTextStyle?.color || theme.colors.primary[600]) : 
                          theme.colors.gray[500],
                        fontWeight: isActive ? "700" : "500",
                        fontSize: isActive ? 16 : 15,
                      },
                      isActive && activeTextStyle
                    ]}
                    numberOfLines={1}
                  >
                    {tab.title}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
        {Object.keys(tabLayouts).length > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: indicatorWidthAnim,
                backgroundColor: indicatorStyle?.backgroundColor || theme.colors.primary[500],
                transform: [{ translateX: indicatorAnim }],
              },
              indicatorStyle
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
    backgroundColor: '#F9FAFC',
    borderRadius: 999,
    marginTop: 16,
    marginBottom: 8,
    ...Platform.select({
      web: {
        scrollbarWidth: 'none',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      }
    })
  },
  tabsContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabsRow: {
    flexDirection: "row",
    position: "relative",
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 4,
    padding: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginHorizontal: 2,
    backgroundColor: 'transparent',
    // Make it more tappable on mobile
    minHeight: 44,
    minWidth: 80,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          backgroundColor: 'rgba(0,0,0,0.04)',
        },
      },
    }),
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    textAlign: "center",
    letterSpacing: 0.3,
    ...Platform.select({
      web: {
        userSelect: 'none',
      },
    }),
  },
  indicator: {
    position: "absolute",
    bottom: 8,
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3182CE',
    shadowColor: '#3182CE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tabContent: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 0,
    width: '100%',
    alignSelf: 'center',
  },
})
