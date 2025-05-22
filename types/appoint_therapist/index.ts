// Define all the types used in the application

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Rescheduled';

export interface Appointment {
  id: number;
  patientName: string;
  patientId?: number;
  time: string;
  date?: string;
  status: string;
  notes?: string;
  isExpanded?: boolean;
  video_session_link?: string;
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