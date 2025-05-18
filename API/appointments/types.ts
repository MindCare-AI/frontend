// API/types.ts - Shared types for the appointment system

// Basic user info for appointment-related data
export interface UserInfo {
  id: number;
  first_name: string;
  last_name: string;
  user_name?: string;
  full_name?: string;
}

// Appointment status options
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'pending';

// Appointment model interface
export interface Appointment {
  id: number;
  patient: UserInfo;
  therapist: UserInfo;
  appointment_date: string;
  duration: number;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  video_session_link?: string | null;
}

// Waiting list entry interface
export interface WaitingListEntry {
  id: number;
  patient: UserInfo;
  preferred_days: string[];
  preferred_times: string[];
  notes: string | null;
  status: 'active' | 'matched' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Filter parameters for appointment listing
export interface AppointmentFilterParams {
  status?: AppointmentStatus | string;
  upcoming?: boolean;
  start_date?: string;
  end_date?: string;
  patient_id?: number;
  therapist_id?: number;
}

// Available time slot interface
export interface TimeSlot {
  start: string;
  end: string;
}

// Interface for appointment creation
export interface CreateAppointmentParams {
  therapist_id?: number;
  patient_id?: number;
  appointment_date: string;
  duration_minutes: number;
  notes?: string;
  pain_level?: number;
}

// Interface for waiting list entry creation
export interface CreateWaitingListParams {
  preferred_days: string[];
  preferred_times: string[];
  notes?: string;
}

// Response format for paginated results
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Add to API/appointments/types.ts
export interface FeedbackParams {
  appointment_id: number;
  rating: number;
  comments: string;
}

export interface Feedback {
  id: number;
  appointment_id: number;
  patient_id: number;
  therapist_id: number;
  rating: number;
  comments: string;
  created_at: string;
}