// Appointment status types
export type AppointmentStatus = "Confirmed" | "Pending" | "Scheduled" | "Cancelled" | "Completed"

export type WaitingListStatus = "Pending" | "Notified"

// Appointment type
export interface AppointmentType {
  id: number
  therapist: string
  date: string
  time: string
  status: AppointmentStatus
  isWithin15Min?: boolean
  feedbackSubmitted?: boolean
  notes?: string
}

// Waiting list entry type
export interface WaitingListEntryType {
  id: number
  therapist: string
  requestedDate: string
  preferredTimeSlots: string[]
  status: WaitingListStatus
}

// Therapist type
export interface TherapistType {
  id: number
  name: string
}

// Time slot type
export interface TimeSlotType {
  id: number
  time: string
}
