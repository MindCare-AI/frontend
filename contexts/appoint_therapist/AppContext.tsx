import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Appointment, WaitingListEntry, SessionNote, TimeSlot, NewTimeSlot } from '../../types/appoint_therapist/index';
import { 
  getTherapistAppointments, 
  confirmAppointment as apiConfirmAppointment, 
  completeAppointment as apiCompleteAppointment,
  rescheduleAppointment as apiRescheduleAppointment,
  getSessionNotes,
  updateSessionNote as apiUpdateSessionNote,
  getTherapistWaitingList,
  notifyWaitingListPatient,
  updateTherapistAvailability,
  deleteAvailabilitySlot
} from "../../API/Appointment/therapist";
import { useAuth } from "../AuthContext";
import { format } from "date-fns";

// Define the context type
interface AppContextType {
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  waitingList: WaitingListEntry[];
  sessionNotes: SessionNote[];
  timeSlots: TimeSlot[];
  loading: boolean;
  confirmAppointment: (id: number) => Promise<void>;
  completeAppointment: (id: number) => Promise<void>;
  rescheduleAppointment: (id: number, newTime: string) => Promise<void>;
  toggleAppointmentExpand: (id: number) => void;
  notifyPatient: (id: number) => Promise<void>;
  removeFromWaitingList: (id: number) => Promise<void>;
  updateSessionNote: (id: number, newNote: string) => Promise<void>;
  addTimeSlot: (newSlot: NewTimeSlot) => Promise<void>;
  removeTimeSlot: (id: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { user } = useAuth();

  // Fetch data when the component mounts
  useEffect(() => {
    if (user?.id) {
      refreshData();
    }
  }, [user?.id]);

  // Function to refresh all data
  const refreshData = async () => {
    setLoading(true);
    try {
      // Get today's appointments
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      
      const todayResponse = await getTherapistAppointments({ 
        date: todayStr,
        status: 'scheduled,confirmed,rescheduled'
      });
      
      const todayAppts = (todayResponse as any).results.map((appointment: any) => ({
        id: appointment.id,
        patientName: `${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`,
        time: format(new Date(appointment.appointment_date), 'h:mm a - ') + 
              format(new Date(new Date(appointment.appointment_date).getTime() + 
                     (appointment.duration ? 
                      parseInt(appointment.duration.replace(/\D/g,'')) * 60000 : 
                      60 * 60000)), 'h:mm a'),
        status: appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1),
        notes: appointment.notes || '',
        patientId: appointment.patient?.id
      }));
      
      setTodayAppointments(todayAppts);
      
      // Get upcoming appointments
      const upcomingResponse = await getTherapistAppointments({
        upcoming: true,
        status: 'scheduled,confirmed,rescheduled'
      });
      
      const upcomingAppts = (upcomingResponse as any).results.map((appointment: any) => ({
        id: appointment.id,
        patientName: `${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`,
        date: format(new Date(appointment.appointment_date), 'MMMM d, yyyy'),
        time: format(new Date(appointment.appointment_date), 'h:mm a - ') + 
              format(new Date(new Date(appointment.appointment_date).getTime() + 
                     (appointment.duration ? 
                      parseInt(appointment.duration.replace(/\D/g,'')) * 60000 : 
                      60 * 60000)), 'h:mm a'),
        notes: appointment.notes || '',
        isExpanded: false,
        status: appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1),
        patientId: appointment.patient?.id
      }));
      
      setUpcomingAppointments(upcomingAppts);
      
      // Get waiting list
      const waitingListResponse = await getTherapistWaitingList();
      
      const waitingListEntries = (waitingListResponse as any).results.map((entry: any) => ({
        id: entry.id,
        patientName: `${entry.patient?.first_name || ''} ${entry.patient?.last_name || ''}`,
        requestDate: format(new Date(entry.created_at), 'MMMM d, yyyy'),
        preferredDates: entry.preferred_dates.map((date: string) => 
          format(new Date(date), 'MMMM d, yyyy')),
        preferredTimeSlots: entry.preferred_time_slots,
        status: entry.notified ? 'Notified' : 'Pending',
        patientId: entry.patient?.id
      }));
      
      setWaitingList(waitingListEntries);
      
      // Get session notes
      const notesResponse = await getSessionNotes();
      
      const notes = (notesResponse as any).results.map((note: any) => ({
        id: note.id,
        patientName: `${note.patient?.first_name || ''} ${note.patient?.last_name || ''}`,
        date: note.session_date ? format(new Date(note.session_date), 'MMMM d, yyyy') : 'No date',
        notes: note.notes,
        patientId: note.patient?.id
      }));
      
      setSessionNotes(notes);
      
      // Would need another API endpoint to get availability slots
      // For now, we'll leave the existing slots
      
    } catch (error) {
      console.error("Error refreshing therapist data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to confirm an appointment
  const confirmAppointment = async (id: number) => {
    try {
      await apiConfirmAppointment(id);
      await refreshData();
    } catch (error) {
      console.error(`Error confirming appointment ${id}:`, error);
      throw error;
    }
  };

  // Function to mark an appointment as completed
  const completeAppointment = async (id: number) => {
    try {
      await apiCompleteAppointment(id);
      await refreshData();
    } catch (error) {
      console.error(`Error completing appointment ${id}:`, error);
      throw error;
    }
  };

  // Function to reschedule an appointment
  const rescheduleAppointment = async (id: number, newTime: string) => {
    try {
      // Parse the new time and create an ISO string
      // This is a simplified example - would need proper date parsing based on your format
      const appointment = [...todayAppointments, ...upcomingAppointments]
        .find(app => app.id === id);
      
      if (!appointment) throw new Error(`Appointment ${id} not found`);
      
      const dateStr = appointment.date || format(new Date(), 'MMMM d, yyyy');
      const dateTimeStr = `${dateStr} ${newTime.split(' - ')[0]}`;
      const dateObj = new Date(dateTimeStr);
      const isoString = dateObj.toISOString();
      
      await apiRescheduleAppointment(id, isoString);
      await refreshData();
    } catch (error) {
      console.error(`Error rescheduling appointment ${id}:`, error);
      throw error;
    }
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
  const notifyPatient = async (id: number) => {
    try {
      await notifyWaitingListPatient(id);
      await refreshData();
    } catch (error) {
      console.error(`Error notifying patient ${id}:`, error);
      throw error;
    }
  };

  // Function to remove an entry from the waiting list
  const removeFromWaitingList = async (id: number) => {
    try {
      // This endpoint would need to be added to the API
      // For now, we'll just refresh the data to simulate removal
      console.warn("removeFromWaitingList endpoint not implemented in API");
      await refreshData();
    } catch (error) {
      console.error(`Error removing from waiting list ${id}:`, error);
      throw error;
    }
  };

  // Function to update a session note
  const updateSessionNote = async (id: number, newNote: string) => {
    try {
      await apiUpdateSessionNote(id, { notes: newNote });
      await refreshData();
    } catch (error) {
      console.error(`Error updating session note ${id}:`, error);
      throw error;
    }
  };

  // Function to add a new time slot
  const addTimeSlot = async (newSlot: NewTimeSlot) => {
    try {
      await updateTherapistAvailability({
        day_of_week: newSlot.day,
        start_time: newSlot.startTime,
        end_time: newSlot.endTime
      });
      await refreshData();
    } catch (error) {
      console.error("Error adding time slot:", error);
      throw error;
    }
  };

  // Function to remove a time slot
  const removeTimeSlot = async (id: number) => {
    try {
      await deleteAvailabilitySlot(id);
      await refreshData();
    } catch (error) {
      console.error(`Error removing time slot ${id}:`, error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        todayAppointments,
        upcomingAppointments,
        waitingList,
        sessionNotes,
        timeSlots,
        loading,
        confirmAppointment,
        completeAppointment,
        rescheduleAppointment,
        toggleAppointmentExpand,
        notifyPatient,
        removeFromWaitingList,
        updateSessionNote,
        addTimeSlot,
        removeTimeSlot,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};