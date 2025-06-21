import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import {
  getAppointments,
  rescheduleAppointment,
  confirmAppointment,
  cancelAppointment,
  completeAppointment
  // Add other API functions as you implement them
} from '../../API/Appointment/therapist';
import type { Appointment, AppointmentResponse } from '../../types/appoint_therapist/index';

// Helper function to transform AppointmentResponse to Appointment
const transformAppointmentResponse = (response: any): Appointment => {
  return {
    id: response.id,
    patientName: response.patient_name,
    time: response.appointment_date,
    appointment_date: response.appointment_date,
    status: response.status,
    notes: response.notes || '',
    video_session_link: response.video_session_link,
    confirmation_date: response.confirmation_date,
    confirmed_by: response.confirmed_by,
    completion_date: response.completion_date,
    completed_by: response.completed_by,
  };
};

// Define your context types
type AppContextType = {
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  waitingList: any[]; // Replace 'any' with your WaitingListEntry type if available
  sessionNotes: any[]; // Replace 'any' with your SessionNote type if available
  timeSlots: any[]; // Replace 'any' with your TimeSlot type if available
  loading: boolean;
  refreshAppointments: () => Promise<void>;
  rescheduleAppointment: (appointmentId: number | string, newDateTime: string, notes?: string) => Promise<Appointment>;
  confirmAppointment: (appointmentId: number | string) => Promise<void>;
  cancelAppointment: (appointmentId: number) => Promise<void>;
  completeAppointment: (appointmentId: number | string) => Promise<Appointment>;
  // Add action methods as you implement them
};

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [sessionNotes, setSessionNotes] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Define the expected API response type
  type AppointmentsApiResponse = {
    results: Appointment[];
    // ...add other fields if needed
  };

  // Cross-platform date formatting helper
  const formatDate = (date: Date): string => {
    return date.toISOString().slice(0, 10);
  };

  // Fetch and split appointments into today/upcoming
  const refreshAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments() as AppointmentsApiResponse;
      const today: Appointment[] = [];
      const upcoming: Appointment[] = [];
      
      // Use cross-platform date handling
      const now = formatDate(new Date());
      
      for (const appt of data.results || []) {
        // Use appointment_date from API response, fallback to date
        const apptDateString = appt.appointment_date || appt.date;
        const apptDate = apptDateString?.slice(0, 10);
        if (apptDate === now) today.push(appt);
        else if (apptDate && apptDate > now) upcoming.push(appt); // Only add future appointments to upcoming
      }
      setTodayAppointments(today);
      setUpcomingAppointments(upcoming);
      // ...set other state as needed...
    } catch (error) {
      console.error('[AppContext] Error fetching appointments:', error);
      // Cross-platform error handling
      const errorMessage = 'Unable to load appointments. Please try again later.';
      if (Platform.OS === 'web') {
        console.error(errorMessage, error);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle appointment rescheduling
  const handleRescheduleAppointment = async (
    appointmentId: number | string, 
    newDateTime: string, 
    notes?: string
  ): Promise<Appointment> => {
    setLoading(true);
    try {
      // Call the API to reschedule the appointment
      const response = await rescheduleAppointment(appointmentId, newDateTime, notes);
      const updatedAppointment = transformAppointmentResponse(response);
      
      // Refresh appointments to update the lists
      await refreshAppointments();
      
      // Cross-platform success feedback
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Appointment rescheduled successfully');
      }
      
      return updatedAppointment;
    } catch (error) {
      console.error('[AppContext] Error rescheduling appointment:', error);
      // Cross-platform error handling
      const errorMessage = 'Failed to reschedule appointment. Please try again.';
      if (Platform.OS !== 'web') {
        Alert.alert('Error', errorMessage);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to handle appointment confirmation
  const handleConfirmAppointment = async (appointmentId: number | string): Promise<void> => {
    setLoading(true);
    try {
      // Call the API to confirm the appointment
      await confirmAppointment(appointmentId);
      
      // Refresh appointments to update the lists
      await refreshAppointments();
      
      // Cross-platform success feedback
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Appointment confirmed successfully');
      }
    } catch (error) {
      console.error('[AppContext] Error confirming appointment:', error);
      // Cross-platform error handling
      const errorMessage = 'Failed to confirm appointment. Please try again.';
      if (Platform.OS !== 'web') {
        Alert.alert('Error', errorMessage);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to handle appointment cancellation
  const handleCancelAppointment = async (appointmentId: number): Promise<void> => {
    setLoading(true);
    try {
      // Call the API to cancel the appointment
      await cancelAppointment(appointmentId);
      
      // Refresh appointments to update the lists
      await refreshAppointments();
      
      // Cross-platform success feedback
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Appointment cancelled successfully');
      }
    } catch (error) {
      console.error('[AppContext] Error canceling appointment:', error);
      // Cross-platform error handling
      const errorMessage = 'Failed to cancel appointment. Please try again.';
      if (Platform.OS !== 'web') {
        Alert.alert('Error', errorMessage);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to handle appointment completion
  const handleCompleteAppointment = async (appointmentId: number | string): Promise<Appointment> => {
    setLoading(true);
    try {
      // Call the API to complete the appointment
      const response = await completeAppointment(appointmentId);
      const completedAppointment = transformAppointmentResponse(response);
      
      // Refresh appointments to update the lists
      await refreshAppointments();
      
      // Cross-platform success feedback
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Appointment marked as completed');
      }
      
      return completedAppointment;
    } catch (error) {
      console.error('[AppContext] Error completing appointment:', error);
      // Cross-platform error handling
      const errorMessage = 'Failed to complete appointment. Please try again.';
      if (Platform.OS !== 'web') {
        Alert.alert('Error', errorMessage);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Use setTimeout to ensure the component is mounted properly across platforms
    const timerId = setTimeout(() => {
      refreshAppointments();
    }, 0);
    
    return () => clearTimeout(timerId);
  }, []);

  return (
    <AppContext.Provider
      value={{
        todayAppointments,
        upcomingAppointments,
        waitingList,
        sessionNotes,
        timeSlots,
        loading,
        refreshAppointments,
        rescheduleAppointment: handleRescheduleAppointment,
        confirmAppointment: handleConfirmAppointment,
        cancelAppointment: handleCancelAppointment,
        completeAppointment: handleCompleteAppointment,
        // ...add other state/actions as you implement...
      }}
    >
      {children}
    </AppContext.Provider>
  );
};