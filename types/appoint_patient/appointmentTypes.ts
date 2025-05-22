// Appointment status types
export type AppointmentStatus = "Confirmed" | "Pending" | "Scheduled" | "Cancelled" | "Completed"

export type WaitingListStatus = "Pending" | "Notified"

// Appointment type
export type AppointmentType = {
  id: number
  appointment_id: string
  therapist: string
  patient?: string
  appointment_date: string
  date: string
  time: string
  status: string
  isWithin15Min?: boolean
  is_upcoming: boolean
  is_past: boolean
  can_cancel: boolean
  can_confirm: boolean
  can_complete: boolean
  notes?: string
  duration: number | string
  created_at: string
  updated_at: string
  video_session_link?: string
  cancelled_by?: number | null
  cancelled_by_name?: string | null
  cancellation_reason?: string
  reminder_sent: boolean
  original_date?: string
  reschedule_count: number
  last_rescheduled?: string | null
  rescheduled_by?: number | null
  rescheduled_by_name?: string | null
  pain_level?: number | null
  feedbackSubmitted?: boolean
}

// Waiting list entry type
export type WaitingListEntryType = {
  id: number
  therapist: string
  requestedDate: string // Matches usage in WaitingListCard.tsx
  preferredTimeSlots: string[]
  status: string
  isExpired?: boolean // Added to match usage in WaitingListCard.tsx
  created_at?: string
  notified_at?: string | null
  expires_at?: string
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

// Feedback type
export type AppointmentFeedbackType = {
  rating: number
  comments: string
}
