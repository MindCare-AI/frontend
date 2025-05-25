"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode, useEffect } from "react"
import type { AppointmentType, WaitingListEntryType } from "../../types/appoint_patient/appointmentTypes"
import axios from 'axios'
import {
  getAppointments,
  createAppointment as apiCreateAppointment,
  cancelAppointment as apiCancelAppointment,
  submitAppointmentFeedback,
  getWaitingList,
  addToWaitingList as apiAddToWaitingList,
  removeFromWaitingList
} from "../../API/Appointment/patient"
import { useAuth } from "../AuthContext"
import { format } from "date-fns"
import { isWithin15Minutes } from "../../utils/Appointment/dateUtils"
import { API_URL } from "../../config"

// Define appointment URL from the patient API file
const APPOINTMENTS_URL = `${API_URL}/appointments`

// Define the context type
type AppointmentContextType = {
  upcomingAppointments: AppointmentType[]
  pastAppointments: AppointmentType[]
  waitingListEntries: WaitingListEntryType[]
  loading: boolean
  addAppointment: (appointmentData: {
    therapist_id: number;
    appointment_date: string;
    notes?: string;
  }) => Promise<void>
  cancelAppointment: (id: number) => Promise<void>
  rescheduleAppointment: (id: number, newDate: string, newTime: string) => Promise<void>
  submitFeedback: (id: number, rating: number, comment: string) => Promise<void>
  addToWaitingList: (entry: {
    therapist_id: number;
    preferred_dates: string[];
    preferred_time_slots: string[];
    notes?: string;
  }) => Promise<void>
  cancelWaitingListEntry: (id: number) => Promise<void>
  selectedAppointment: AppointmentType | null
  setSelectedAppointment: (appointment: AppointmentType | null) => void
  refreshAppointments: () => Promise<void>
}

// Create the context
const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined)

// Provider component
export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentType[]>([])
  const [pastAppointments, setPastAppointments] = useState<AppointmentType[]>([])
  const [waitingListEntries, setWaitingListEntries] = useState<WaitingListEntryType[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentType | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  
  const { user } = useAuth()

  // Fetch appointments when the component mounts
  useEffect(() => {
    if (user?.id) {
      refreshAppointments()
    }
  }, [user?.id])

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

  // Function to refresh all appointment data
  const refreshAppointments = async () => {
    setLoading(true)
    try {
      // Fetch all upcoming appointments
      const allUpcoming = await fetchAllPaginated(getAppointments, { status: 'scheduled,confirmed,rescheduled' });
      const upcoming = allUpcoming.map((appointment: any) => ({
        id: appointment.id,
        appointment_id: appointment.appointment_id,
        therapist: appointment.therapist_name || `${appointment.therapist?.first_name || ''} ${appointment.therapist?.last_name || ''}`,
        patient: appointment.patient_name,
        appointment_date: appointment.appointment_date,
        date: format(new Date(appointment.appointment_date), 'MMMM d, yyyy'),
        time: format(new Date(appointment.appointment_date), 'h:mm a'),
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
      setUpcomingAppointments(upcoming)

      // Fetch all past appointments
      const allPast = await fetchAllPaginated(getAppointments, { status: 'completed,cancelled,missed' });
      const past = allPast.map((appointment: any) => ({
        id: appointment.id,
        appointment_id: appointment.appointment_id,
        therapist: appointment.therapist_name || `${appointment.therapist?.first_name || ''} ${appointment.therapist?.last_name || ''}`,
        patient: appointment.patient_name,
        appointment_date: appointment.appointment_date,
        date: format(new Date(appointment.appointment_date), 'MMMM d, yyyy'),
        time: format(new Date(appointment.appointment_date), 'h:mm a'),
        status: (appointment.status || '').replace(/^./, (c: string) => c.toUpperCase()),
        feedbackSubmitted: Boolean(appointment.feedback),
        is_upcoming: appointment.is_upcoming,
        is_past: appointment.is_past,
        can_cancel: appointment.can_cancel,
        can_confirm: appointment.can_confirm,
        can_complete: appointment.can_complete,
        notes: appointment.notes || "No notes available",
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
      setPastAppointments(past)

      // Fetch all waiting list entries
      const allWaiting = await fetchAllPaginated(getWaitingList);
      const waitingList = allWaiting.map((entry: any) => ({
        id: entry.id,
        therapist: `${entry.therapist?.first_name || ''} ${entry.therapist?.last_name || ''}`,
        requestedDate: entry.requested_date
          ? format(new Date(entry.requested_date), 'MMMM d, yyyy')
          : '',
        preferredTimeSlots: Array.isArray(entry.preferred_time_slots)
          ? entry.preferred_time_slots.map((time: string) => {
              if (time === 'morning') return 'Morning';
              if (time === 'afternoon') return 'Afternoon';
              if (time === 'evening') return 'Evening';
              return time;
            })
          : [],
        status: (entry.status || '').replace(/^./, (c: string) => c.toUpperCase()),
      }))
      setWaitingListEntries(waitingList)

    } catch (error) {
      console.error("Error refreshing appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  // Add a new appointment
  const addAppointment = async (appointmentData: {
    therapist_id: number;
    appointment_date: string;
    notes?: string;
  }) => {
    try {
      // Map therapist_id to therapist for API compatibility
      const apiData = {
        therapist: appointmentData.therapist_id,
        appointment_date: appointmentData.appointment_date,
        notes: appointmentData.notes,
      };
      await apiCreateAppointment(apiData);
      await refreshAppointments(); // Refresh the list after adding
    } catch (error) {
      console.error("Error adding appointment:", error);
      throw error;
    }
  }

  // Cancel an appointment
  const cancelAppointment = async (id: number) => {
    try {
      await apiCancelAppointment(id)
      await refreshAppointments() // Refresh the list after cancellation
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      throw error
    }
  }

  // Reschedule an appointment
  const rescheduleAppointment = async (id: number, newDate: string, newTime: string) => {
    try {
      setLoading(true)
      // Format the appointment date
      const appointmentDate = `${newDate}T${newTime}`
      
      // Update the appointment with the new date
      await axios.put(`${APPOINTMENTS_URL}/${id}/reschedule/`, { 
        appointment_date: appointmentDate,
        notes: "Rescheduled by patient" 
      })
      
      // Refresh appointments to get the updated list
      await refreshAppointments()
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Submit feedback for an appointment
  const submitFeedback = async (id: number, rating: number, comment: string) => {
    try {
      await submitAppointmentFeedback(id, { rating, comments: comment })
      await refreshAppointments() // Refresh to update the feedback status
    } catch (error) {
      console.error("Error submitting feedback:", error)
      throw error
    }
  }

  // Add to waiting list
  const addToWaitingList = async (entryData: {
    therapist_id: number;
    preferred_dates: string[];
    preferred_time_slots: string[];
    notes?: string;
  }) => {
    try {
      await apiAddToWaitingList(entryData)
      await refreshAppointments() // Refresh to show the new waiting list entry
    } catch (error) {
      console.error("Error adding to waiting list:", error)
      throw error
    }
  }

  // Cancel waiting list entry
  const cancelWaitingListEntry = async (id: number) => {
    try {
      await removeFromWaitingList(id)
      await refreshAppointments() // Refresh to update the waiting list
    } catch (error) {
      console.error("Error cancelling waiting list entry:", error)
      throw error
    }
  }

  return (
    <AppointmentContext.Provider
      value={{
        upcomingAppointments,
        pastAppointments,
        waitingListEntries,
        loading,
        addAppointment,
        cancelAppointment,
        rescheduleAppointment,
        submitFeedback,
        addToWaitingList,
        cancelWaitingListEntry,
        selectedAppointment,
        setSelectedAppointment,
        refreshAppointments,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  )
}

// Custom hook to use the appointment context
export const useAppointments = () => {
  const context = useContext(AppointmentContext)
  if (context === undefined) {
    throw new Error("useAppointments must be used within an AppointmentProvider")
  }
  return context
}
