"use client"

import type React from "react"
import { useState, useRef } from "react"
import { View, Animated, Platform } from "react-native"
import UpcomingAppointments from "./UpcomingAppointments"
import PastAppointments from "./PastAppointments"
import WaitingList from "./WaitingList"
import { Tabs, TabContent } from "./ui"
import { useBreakpointValue, useTheme } from "native-base"

type AppointmentTabsProps = {
  onOpenFeedback: (appointment: any) => void
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({ onOpenFeedback }) => {
  const [activeTab, setActiveTab] = useState("upcoming")
  const isMobile = useBreakpointValue({ base: true, md: false })
  const theme = useTheme()
  const fadeAnim = useRef(new Animated.Value(1)).current

  const handleTabChange = (tabKey: string) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tabKey)
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start()
    })
  }

  const tabs = [
    { key: "upcoming", title: "Upcoming" },
    { key: "past", title: "Past" },
    { key: "waiting", title: "Waiting List" },
  ]

  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#F3F4F6', minHeight: '100%' }}>
      <View
        style={{
          width: '100%',
          maxWidth: 520,
          alignSelf: 'center',
          marginTop: 0,
          marginBottom: 0,
          backgroundColor: '#fff',
          borderRadius: 20,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <Tabs
          tabs={tabs}
          initialTab="upcoming"
          onChange={handleTabChange}
          style={[
            styles.tabsContainer,
            {
              marginBottom: useBreakpointValue({ base: 8, md: 12 }),
              paddingHorizontal: isMobile ? 0 : 24,
              backgroundColor: '#fff',
              borderRadius: 999,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              alignSelf: 'center',
              marginTop: 0,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              paddingHorizontal: isMobile ? 0 : 24,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
              minHeight: 400,
            },
          ]}
        >
          <TabContent tabKey="upcoming" activeTab={activeTab}>
            <UpcomingAppointments />
          </TabContent>

          <TabContent tabKey="past" activeTab={activeTab}>
            <PastAppointments onOpenFeedback={onOpenFeedback} />
          </TabContent>

          <TabContent tabKey="waiting" activeTab={activeTab}>
            <WaitingList />
          </TabContent>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  contentContainer: {
    flex: 1,
  },
}

export default AppointmentTabs
