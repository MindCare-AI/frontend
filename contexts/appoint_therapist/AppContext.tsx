import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Appointment, WaitingListEntry, SessionNote, TimeSlot, NewTimeSlot } from '../../types/appoint_therapist/index';

// Mock data
const todayAppointmentsMock: Appointment[] = [
  {
    id: 1,
    patientName: "Jane Smith",
    time: "10:00 AM - 11:00 AM",
    status: "Pending",
  },
  {
    id: 2,
    patientName: "Michael Johnson",
    time: "1:00 PM - 2:00 PM",
    status: "Confirmed",
  },
  {
    id: 3,
    patientName: "Emily Davis",
    time: "3:30 PM - 4:30 PM",
    status: "Confirmed",
  },
];

const upcomingAppointmentsMock: Appointment[] = [
  {
    id: 1,
    patientName: "Robert Wilson",
    date: "May 10, 2025",
    time: "2:00 PM - 3:00 PM",
    notes: "Follow-up session on anxiety management techniques.",
    isExpanded: false,
    status: "Confirmed" // Add the required status
  },
  {
    id: 2,
    patientName: "Sarah Johnson",
    date: "May 12, 2025",
    time: "10:30 AM - 11:30 AM",
    notes: "Initial consultation. Patient reported symptoms of depression.",
    isExpanded: false,
    status: "Pending" // Add the required status
  },
  {
    id: 3,
    patientName: "David Thompson",
    date: "May 15, 2025",
    time: "4:00 PM - 5:00 PM",
    notes: "Third session. Continue working on stress reduction strategies.",
    isExpanded: false,
    status: "Confirmed" // Add the required status
  },
];

const waitingListMock: WaitingListEntry[] = [
  {
    id: 1,
    patientName: "Thomas Brown",
    requestedDate: "May 20, 2025",
    preferredTimeSlots: ["Morning", "Early Afternoon"],
    status: "Pending",
    isExpired: false,
  },
  {
    id: 2,
    patientName: "Lisa Garcia",
    requestedDate: "May 18, 2025",
    preferredTimeSlots: ["Late Afternoon"],
    status: "Notified",
    isExpired: false,
  },
  {
    id: 3,
    patientName: "James Wilson",
    requestedDate: "May 8, 2025",
    preferredTimeSlots: ["Morning"],
    status: "Pending",
    isExpired: true,
  },
];

const sessionNotesMock: SessionNote[] = [
  {
    id: 1,
    patientName: "Jane Smith",
    date: "May 2, 2025",
    notes: "Patient reported reduced anxiety symptoms. Discussed mindfulness techniques and assigned daily practice. Follow up on progress in next session.",
  },
  {
    id: 2,
    patientName: "Michael Johnson",
    date: "May 1, 2025",
    notes: "Initial assessment completed. Patient experiencing work-related stress and mild insomnia. Recommended sleep hygiene practices and scheduled weekly sessions.",
  },
  {
    id: 3,
    patientName: "Emily Davis",
    date: "April 28, 2025",
    notes: "Continued CBT exercises. Patient showing good progress with thought challenging techniques. Discussed potential triggers and developed coping strategies.",
  },
];

const initialTimeSlots: TimeSlot[] = [
  { id: 1, day: "Monday", startTime: "9:00 AM", endTime: "5:00 PM" },
  { id: 2, day: "Tuesday", startTime: "10:00 AM", endTime: "6:00 PM" },
  { id: 3, day: "Wednesday", startTime: "9:00 AM", endTime: "5:00 PM" },
  { id: 4, day: "Thursday", startTime: "9:00 AM", endTime: "5:00 PM" },
  { id: 5, day: "Friday", startTime: "9:00 AM", endTime: "3:00 PM" },
];

// Available time slots for rescheduling
export const availableTimeSlots = [
  "9:00 AM - 10:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "2:00 PM - 3:00 PM",
  "4:30 PM - 5:30 PM",
];

// Define the context type
interface AppContextType {
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  waitingList: WaitingListEntry[];
  sessionNotes: SessionNote[];
  timeSlots: TimeSlot[];
  confirmAppointment: (id: number) => void;
  completeAppointment: (id: number) => void;
  rescheduleAppointment: (id: number, newTime: string) => void;
  toggleAppointmentExpand: (id: number) => void;
  notifyPatient: (id: number) => void;
  removeFromWaitingList: (id: number) => void;
  updateSessionNote: (id: number, newNote: string) => void;
  addTimeSlot: (newSlot: NewTimeSlot) => void;
  removeTimeSlot: (id: number) => void;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>(todayAppointmentsMock);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>(upcomingAppointmentsMock);
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>(waitingListMock);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>(sessionNotesMock);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(initialTimeSlots);

  // Function to confirm an appointment
  const confirmAppointment = (id: number) => {
    setTodayAppointments(
      todayAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status: "Confirmed" } : appointment
      )
    );
  };

  // Function to mark an appointment as completed
  const completeAppointment = (id: number) => {
    setTodayAppointments(
      todayAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status: "Completed" } : appointment
      )
    );
  };

  // Function to reschedule an appointment
  const rescheduleAppointment = (id: number, newTime: string) => {
    setTodayAppointments(
      todayAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, time: newTime, status: "Rescheduled" } : appointment
      )
    );
  };

  // Function to toggle the expanded state of an upcoming appointment
  const toggleAppointmentExpand = (id: number) => {
    setUpcomingAppointments(
      upcomingAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, isExpanded: !appointment.isExpanded } : appointment
      )
    );
  };

  // Function to notify a patient on the waiting list
  const notifyPatient = (id: number) => {
    setWaitingList(
      waitingList.map((entry) =>
        entry.id === id ? { ...entry, status: "Notified" } : entry
      )
    );
  };

  // Function to remove an entry from the waiting list
  const removeFromWaitingList = (id: number) => {
    setWaitingList(waitingList.filter((entry) => entry.id !== id));
  };

  // Function to update a session note
  const updateSessionNote = (id: number, newNote: string) => {
    setSessionNotes(
      sessionNotes.map((note) =>
        note.id === id ? { ...note, notes: newNote } : note
      )
    );
  };

  // Function to add a new time slot
  const addTimeSlot = (newSlot: NewTimeSlot) => {
    const newId = Math.max(0, ...timeSlots.map((slot) => slot.id)) + 1;
    setTimeSlots([...timeSlots, { ...newSlot, id: newId }]);
  };

  // Function to remove a time slot
  const removeTimeSlot = (id: number) => {
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
  };

  // Create the context value
  const contextValue: AppContextType = {
    todayAppointments,
    upcomingAppointments,
    waitingList,
    sessionNotes,
    timeSlots,
    confirmAppointment,
    completeAppointment,
    rescheduleAppointment,
    toggleAppointmentExpand,
    notifyPatient,
    removeFromWaitingList,
    updateSessionNote,
    addTimeSlot,
    removeTimeSlot,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// Create a custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};