// Define all the types used in the application

/**
 * Appointment status flow:
 * pending -> confirmed -> completed
 * Any status can be canceled
 */
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'canceled' | 'rescheduled' | 'scheduled';

export interface Appointment {
  appointment_date: any;
  id: number | string;
  patientName: string;
  patientId?: number;
  time: string;
  date?: string;
  status: AppointmentStatus;
  notes?: string;
  isExpanded?: boolean;
  video_session_link?: string;
  confirmation_date?: string;
  confirmed_by?: string;
  completion_date?: string;
  completed_by?: string;
}

export interface AppointmentResponse {
  id: number | string;
  appointment_id: string;
  appointment_date: string;
  patient_name: string;
  status: AppointmentStatus;
  confirmed_by?: string;
  confirmation_date?: string;
  video_session_link?: string;
  conversation_created?: boolean;
  duration?: string;
  completed_by?: string;
  completion_date?: string;
}

export interface WaitingListEntry {
  id: number;
  patientName: string;
  patientId?: number;
  requestDate: string;
  preferredDates: string[];
  preferredTimeSlots: string[];
  status: "Pending" | "Notified";
}

export interface SessionNote {
  id: number;
  patientName: string;
  patientId?: number;
  date: string;
  notes: string;
}

export interface TimeSlot {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
}

export interface NewTimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
};

export type DrawerParamList = {
  Dashboard: undefined;
  Appointments: undefined;
  Profile: undefined;
  Settings: undefined;
};