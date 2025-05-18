"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react" // Added useEffect
import { View, Animated, Platform } from "react-native"
import UpcomingAppointments from "./UpcomingAppointments"
import PastAppointments from "./PastAppointments"
import WaitingList from "./WaitingList"
import { Tabs, TabContent } from "./ui"
import { useBreakpointValue, useTheme } from "native-base"
import { getAppointments } from "../../../API/appointments/appointments" // Import API
import { getWaitingList } from "../../../API/appointments/waitingList" // Import API
import { AppointmentType, WaitingListEntryType } from "../../../types/appointmentTypes"

type AppointmentTabsProps = {
  onOpenFeedback: (appointment: any) => void
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({ onOpenFeedback }) => {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [loading, setLoading] = useState(false)
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentType[]>([])
  const [pastAppointments, setPastAppointments] = useState<AppointmentType[]>([])
  const [waitingListEntries, setWaitingListEntries] = useState<WaitingListEntryType[]>([])
  
  const isMobile = useBreakpointValue({ base: true, md: false })
  const theme = useTheme()
  const fadeAnim = useRef(new Animated.Value(1)).current

  // Fetch data when the active tab changes
  useEffect(() => {
    fetchTabData(activeTab)
  }, [activeTab])

  const fetchTabData = async (tabKey: string) => {
    setLoading(true)
    try {
      if (tabKey === "upcoming") {
        const response = await getAppointments({ upcoming: true })
        // Transform API data to match your frontend model
        const appointments = response.results.map(appointment => ({
          id: appointment.id,
          therapist: `${appointment.therapist.first_name} ${appointment.therapist.last_name}`,
          date: new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric' 
          }),
          time: new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: 'numeric', hour12: true
          }),
          status: appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1),
          isWithin15Min: isWithin15Minutes(appointment.appointment_date),
          notes: appointment.notes || undefined
        }))
        setUpcomingAppointments(appointments)
      } else if (tabKey === "past") {
        const response = await getAppointments({ 
          status: 'completed,cancelled',
        })
        const appointments = response.results.map(appointment => ({
          id: appointment.id,
          therapist: `${appointment.therapist.first_name} ${appointment.therapist.last_name}`,
          date: new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric' 
          }),
          time: new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: 'numeric', hour12: true
          }),
          status: appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1),
          feedbackSubmitted: Boolean(appointment.feedback),
          notes: appointment.notes || "No notes provided"
        }))
        setPastAppointments(appointments)
      } else if (tabKey === "waiting") {
        const response = await getWaitingList()
        const entries = response.results.map(entry => ({
          id: entry.id,
          therapist: `${entry.therapist.first_name} ${entry.therapist.last_name}`,
          requestedDate: new Date(entry.preferred_days[0]).toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric' 
          }),
          preferredTimeSlots: entry.preferred_times.map(time => 
            time === 'morning' ? 'Morning' : 
            time === 'afternoon' ? 'Afternoon' : 'Evening'
          ),
          status: entry.status === 'active' ? 'Pending' :
                 entry.status === 'matched' ? 'Notified' : 'Cancelled'
        }))
        setWaitingListEntries(entries)
      }
    } catch (error) {
      console.error(`Error fetching data for ${tabKey} tab:`, error)
    } finally {
      setLoading(false)
    }
  }

  // Helper to check if appointment is within 15 minutes
  const isWithin15Minutes = (appointmentDate: string): boolean => {
    const appointmentTime = new Date(appointmentDate).getTime()
    const now = new Date().getTime()
    const timeDiff = appointmentTime - now
    return timeDiff > 0 && timeDiff <= 15 * 60 * 1000
  }

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
                }),
              },
            ],
            flex: 1,
          },
        ]}
      >
        <TabContent tabKey="upcoming" activeTab={activeTab} style={{ flex: 1 }}>
          <UpcomingAppointments 
            appointments={upcomingAppointments} 
            loading={loading && activeTab === "upcoming"} 
          />
        </TabContent>

        <TabContent tabKey="past" activeTab={activeTab} style={{ flex: 1 }}>
          <PastAppointments 
            appointments={pastAppointments}
            loading={loading && activeTab === "past"}
            onOpenFeedback={onOpenFeedback} 
          />
        </TabContent>

        <TabContent tabKey="waiting" activeTab={activeTab} style={{ flex: 1 }}>
          <WaitingList 
            entries={waitingListEntries}
            loading={loading && activeTab === "waiting"}
          />
        </TabContent>
      </Animated.View>
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
