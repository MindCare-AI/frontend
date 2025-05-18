// Define all the types used in the application

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Rescheduled';

export interface Appointment {
  id: number;
  patientName: string;
  time: string;
  date?: string;
  status: AppointmentStatus;
  notes?: string;
  isExpanded?: boolean;
}

export interface WaitingListEntry {
  id: number;
  patientName: string;
  requestedDate: string;
  preferredTimeSlots: string[];
  status: 'Pending' | 'Notified';
  isExpired: boolean;
}

export interface SessionNote {
  id: number;
  patientName: string;
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