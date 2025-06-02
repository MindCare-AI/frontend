"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { View, Animated, Platform, StyleSheet } from "react-native"
import UpcomingAppointments from "./UpcomingAppointments"
import PastAppointments from "./PastAppointments"
import WaitingList from "./WaitingList"
import { Tabs, TabContent } from "./ui"
import { useBreakpointValue, useTheme } from "native-base"
import { getAppointments, getWaitingList } from "../../../API/Appointment/patient"
import { AppointmentType, WaitingListEntryType } from "../../../types/appoint_patient/appointmentTypes"
import { isWithin15Minutes } from "../../../utils/Appointment/dateUtils"

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
  // Fix: Ensure fadeAnim is properly initialized with useNativeDriver support
  const fadeAnim = useRef(new Animated.Value(1)).current

  // Fetch data when the active tab changes
  useEffect(() => {
    fetchTabData(activeTab)
  }, [activeTab])

  // Helper to fetch all paginated results
  const fetchAllPaginated = async (fetchFn: (params: any) => Promise<any>, params: any = {}) => {
    let results: any[] = [];
    let page = 1;
    let hasNext = true;
    while (hasNext) {
      const resp = await fetchFn({ ...params, page });
      if (resp && Array.isArray(resp.results)) {
        results = results.concat(resp.results);
        hasNext = !!resp.next;
        page += 1;
      } else {
        hasNext = false;
      }
    }
    return results;
  };

  const fetchTabData = async (tabKey: string) => {
    setLoading(true)
    try {
      if (tabKey === "upcoming") {
        // Fetch all upcoming appointments (paginated)
        const allAppointments = await fetchAllPaginated(getAppointments, { status: 'scheduled,confirmed,rescheduled' });
        const appointments = allAppointments.map((appointment: any) => ({
          id: appointment.id,
          appointment_id: appointment.appointment_id,
          therapist: appointment.therapist_name || `${appointment.therapist?.first_name || ''} ${appointment.therapist?.last_name || ''}`,
          patient: appointment.patient_name,
          appointment_date: appointment.appointment_date,
          date: new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric' 
          }),
          time: new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: 'numeric', hour12: true
          }),
          status: (appointment.status || '').replace(/^./, (c: string) => c.toUpperCase()),
          isWithin15Min: isWithin15Minutes(appointment.appointment_date),
          is_upcoming: appointment.is_upcoming,
          is_past: appointment.is_past,
          can_cancel: appointment.can_cancel,
          can_confirm: appointment.can_confirm,
          can_complete: appointment.can_complete,
          notes: appointment.notes || undefined,
          duration: appointment.duration,
          created_at: appointment.created_at,
          updated_at: appointment.updated_at,
          video_session_link: appointment.video_session_link,
          cancelled_by: appointment.cancelled_by,
          cancelled_by_name: appointment.cancelled_by_name,
          cancellation_reason: appointment.cancellation_reason,
          reminder_sent: appointment.reminder_sent,
          original_date: appointment.original_date,
          reschedule_count: appointment.reschedule_count,
          last_rescheduled: appointment.last_rescheduled,
          rescheduled_by: appointment.rescheduled_by,
          rescheduled_by_name: appointment.rescheduled_by_name,
          pain_level: appointment.pain_level,
        }))
        setUpcomingAppointments(appointments)
      } else if (tabKey === "past") {
        // Fetch all past appointments (paginated)
        const allAppointments = await fetchAllPaginated(getAppointments, { status: 'completed,cancelled,missed' });
        const appointments = allAppointments.map((appointment: any) => ({
          id: appointment.id,
          appointment_id: appointment.appointment_id,
          therapist: appointment.therapist_name || `${appointment.therapist?.first_name || ''} ${appointment.therapist?.last_name || ''}`,
          patient: appointment.patient_name,
          appointment_date: appointment.appointment_date,
          date: new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric' 
          }),
          time: new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: 'numeric', hour12: true
          }),
          status: (appointment.status || '').replace(/^./, (c: string) => c.toUpperCase()),
          feedbackSubmitted: Boolean(appointment.feedback),
          is_upcoming: appointment.is_upcoming,
          is_past: appointment.is_past,
          can_cancel: appointment.can_cancel,
          can_confirm: appointment.can_confirm,
          can_complete: appointment.can_complete,
          notes: appointment.notes || "No notes provided",
          duration: appointment.duration,
          created_at: appointment.created_at,
          updated_at: appointment.updated_at,
          video_session_link: appointment.video_session_link,
          cancelled_by: appointment.cancelled_by,
          cancelled_by_name: appointment.cancelled_by_name,
          cancellation_reason: appointment.cancellation_reason,
          reminder_sent: appointment.reminder_sent,
          original_date: appointment.original_date,
          reschedule_count: appointment.reschedule_count,
          last_rescheduled: appointment.last_rescheduled,
          rescheduled_by: appointment.rescheduled_by,
          rescheduled_by_name: appointment.rescheduled_by_name,
          pain_level: appointment.pain_level,
        }))
        setPastAppointments(appointments)
      } else if (tabKey === "waiting") {
        // Fetch all waiting list entries (paginated)
        const allEntries = await fetchAllPaginated(getWaitingList);
        const entries = allEntries.map((entry: any) => ({
          id: entry.id,
          therapist: `${entry.therapist?.first_name || ''} ${entry.therapist?.last_name || ''}`,
          requestedDate: entry.requested_date
            ? new Date(entry.requested_date).toLocaleDateString('en-US', { 
                month: 'long', day: 'numeric', year: 'numeric' 
              })
            : '',
          preferredTimeSlots: Array.isArray(entry.preferred_time_slots)
            ? entry.preferred_time_slots.map((time: string) => {
                if (time === 'morning') return 'Morning';
                if (time === 'afternoon') return 'Afternoon';
                if (time === 'evening') return 'Evening';
                return time;
              })
            : [],
          status: (entry.status || '').replace(/^./, (c: string) => c.toUpperCase())
        }))
        setWaitingListEntries(entries)
      }
    } catch (error) {
      console.error(`Error fetching data for ${tabKey} tab:`, error)
    } finally {
      setLoading(false)
    }
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
