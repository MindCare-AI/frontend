"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode } from "react"
import type { AppointmentType, WaitingListEntryType } from "../types/appointmentTypes"

// Sample data
const upcomingAppointmentsData: AppointmentType[] = [
  {
    id: 1,
    therapist: "Dr. John Doe",
    date: "May 15, 2025",
    time: "10:00 AM",
    status: "Confirmed",
    isWithin15Min: true,
  },
  {
    id: 2,
    therapist: "Dr. Jane Smith",
    date: "May 20, 2025",
    time: "2:30 PM",
    status: "Scheduled",
    isWithin15Min: false,
  },
  {
    id: 3,
    therapist: "Dr. Robert Johnson",
    date: "May 25, 2025",
    time: "11:15 AM",
    status: "Pending",
    isWithin15Min: false,
  },
]

const pastAppointmentsData: AppointmentType[] = [
  {
    id: 101,
    therapist: "Dr. John Doe",
    date: "April 30, 2025",
    time: "9:00 AM",
    status: "Completed",
    feedbackSubmitted: true,
    notes: "Follow-up on treatment plan. Patient reported improvement in symptoms.",
  },
  {
    id: 102,
    therapist: "Dr. Jane Smith",
    date: "April 25, 2025",
    time: "3:45 PM",
    status: "Completed",
    feedbackSubmitted: false,
    notes: "Initial consultation. Discussed treatment options and created preliminary plan.",
  },
  {
    id: 103,
    therapist: "Dr. Robert Johnson",
    date: "April 15, 2025",
    time: "1:30 PM",
    status: "Cancelled",
    feedbackSubmitted: false,
    notes: "Appointment cancelled by patient due to scheduling conflict.",
  },
]

const waitingListEntriesData: WaitingListEntryType[] = [
  {
    id: 201,
    therapist: "Dr. John Doe",
    requestedDate: "June 5, 2025",
    preferredTimeSlots: ["Morning", "Afternoon"],
    status: "Pending",
  },
  {
    id: 202,
    therapist: "Dr. Jane Smith",
    requestedDate: "June 10, 2025",
    preferredTimeSlots: ["Afternoon"],
    status: "Notified",
  },
]

// Define the context type
type AppointmentContextType = {
  upcomingAppointments: AppointmentType[]
  pastAppointments: AppointmentType[]
  waitingListEntries: WaitingListEntryType[]
  addAppointment: (appointment: AppointmentType) => void
  cancelAppointment: (id: number) => void
  rescheduleAppointment: (id: number, newDate: string, newTime: string) => void
  submitFeedback: (id: number, rating: number, comment: string) => void
  addToWaitingList: (entry: Omit<WaitingListEntryType, "id" | "status">) => void
  cancelWaitingListEntry: (id: number) => void
  selectedAppointment: AppointmentType | null
  setSelectedAppointment: (appointment: AppointmentType | null) => void
}

// Create the context
const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined)

// Provider component
export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentType[]>(upcomingAppointmentsData)
  const [pastAppointments, setPastAppointments] = useState<AppointmentType[]>(pastAppointmentsData)
  const [waitingListEntries, setWaitingListEntries] = useState<WaitingListEntryType[]>(waitingListEntriesData)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentType | null>(null)

  // Add a new appointment
  const addAppointment = (appointment: AppointmentType) => {
    setUpcomingAppointments([...upcomingAppointments, appointment])
  }

  // Cancel an appointment
  const cancelAppointment = (id: number) => {
    const appointment = upcomingAppointments.find((app) => app.id === id)
    if (appointment) {
      // Move to past appointments with cancelled status
      const cancelledAppointment = { ...appointment, status: "Cancelled" as const }
      setPastAppointments([...pastAppointments, cancelledAppointment])
      // Remove from upcoming
      setUpcomingAppointments(upcomingAppointments.filter((app) => app.id !== id))
    }
  }

  // Reschedule an appointment
  const rescheduleAppointment = (id: number, newDate: string, newTime: string) => {
    setUpcomingAppointments(
      upcomingAppointments.map((app) => (app.id === id ? { ...app, date: newDate, time: newTime } : app)),
    )
  }

  // Submit feedback for an appointment
  const submitFeedback = (id: number, rating: number, comment: string) => {
    setPastAppointments(pastAppointments.map((app) => (app.id === id ? { ...app, feedbackSubmitted: true } : app)))
  }

  // Add to waiting list
  const addToWaitingList = (entry: Omit<WaitingListEntryType, "id" | "status">) => {
    const newEntry: WaitingListEntryType = {
      ...entry,
      id: Date.now(), // Simple ID generation
      status: "Pending",
    }
    setWaitingListEntries([...waitingListEntries, newEntry])
  }

  // Cancel waiting list entry
  const cancelWaitingListEntry = (id: number) => {
    setWaitingListEntries(waitingListEntries.filter((entry) => entry.id !== id))
  }

  return (
    <AppointmentContext.Provider
      value={{
        upcomingAppointments,
        pastAppointments,
        waitingListEntries,
        addAppointment,
        cancelAppointment,
        rescheduleAppointment,
        submitFeedback,
        addToWaitingList,
        cancelWaitingListEntry,
        selectedAppointment,
        setSelectedAppointment,
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
