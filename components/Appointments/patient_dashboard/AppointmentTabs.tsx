"use client"

import type React from "react"
import { useState, useRef } from "react"
import { View, Animated, Platform, StyleSheet } from "react-native"
import UpcomingAppointments from "./UpcomingAppointments"
import PastAppointments from "./PastAppointments"
import WaitingList from "./WaitingList"
import { Tabs, TabContent } from "./ui"
import { useBreakpointValue, useTheme } from "native-base"
import { useAppointments } from "../../../contexts/appoint_patient/AppointmentContext"

type AppointmentTabsProps = {
  onOpenFeedback: (appointment: any) => void
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({ onOpenFeedback }) => {
  const [activeTab, setActiveTab] = useState("upcoming")
  
  // Get data from context instead of managing local state
  const { 
    upcomingAppointments, 
    pastAppointments, 
    waitingListEntries, 
    loading 
  } = useAppointments()
  
  const isMobile = useBreakpointValue({ base: true, md: false })
  const theme = useTheme()
  // Fix: Ensure fadeAnim is properly initialized with useNativeDriver support
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
    <View style={{ flex: 1, width: '100%' }}>
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
            boxShadow: Platform.OS === 'web' ? '0 2px 8px rgba(0,0,0,0.04)' : undefined,
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
                  extrapolate: 'clamp',
                }),
              },
            ],
            flex: 1,
          },
        ]}
      >
        {activeTab === "upcoming" && (
          <UpcomingAppointments 
            appointments={upcomingAppointments} 
            loading={loading} 
          />
        )}

        {activeTab === "past" && (
          <PastAppointments 
            appointments={pastAppointments} 
            loading={loading} 
            onOpenFeedback={onOpenFeedback} 
          />
        )}

        {activeTab === "waiting" && (
          <WaitingList 
            entries={waitingListEntries} 
            loading={loading} 
          />
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
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
})

export default AppointmentTabs
