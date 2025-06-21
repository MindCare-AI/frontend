"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode, useEffect } from "react"
import { Platform, Dimensions } from "react-native"
import type { AppointmentType, WaitingListEntryType } from "../../types/appoint_patient/appointmentTypes"
import axios from 'axios'
import {
  getAppointments,
  createAppointment as apiCreateAppointment,
  cancelAppointment as apiCancelAppointment,
  submitAppointmentFeedback,
  getWaitingList,
  addToWaitingList as apiAddToWaitingList,
  removeFromWaitingList
} from "../../API/Appointment/patient"
import { useAuth } from "../AuthContext"
import { format } from "date-fns"
import { isWithin15Minutes } from "../../utils/Appointment/dateUtils"
import { API_URL } from "../../config"
// Import Tunisian mock data
import { 
  MOCK_APPOINTMENTS, 
  MOCK_THERAPISTS, 
  MOCK_PATIENTS, 
  AZIZ_BAHLOUL,
  generateMockAppointments 
} from "../../data/tunisianMockData"

// Define appointment URL from the patient API file
const APPOINTMENTS_URL = `${API_URL}/appointments`

// Define the context type
type AppointmentContextType = {
  upcomingAppointments: AppointmentType[]
  pastAppointments: AppointmentType[]
  waitingListEntries: WaitingListEntryType[]
  loading: boolean
  screenWidth: number
  isSmallScreen: boolean
  platformOS: string
  addAppointment: (appointmentData: {
    therapist_id: number | string; // Allow both number and string IDs
    appointment_date: string;
    notes?: string;
  }) => Promise<void>
  cancelAppointment: (id: number) => Promise<void>
  rescheduleAppointment: (id: number, newDate: string, newTime: string) => Promise<void>
  submitFeedback: (id: number, rating: number, comment: string) => Promise<void>
  addToWaitingList: (entry: {
    therapist_id: number | string; // Allow both number and string IDs
    preferred_dates: string[];
    preferred_time_slots: string[];
    notes?: string;
  }) => Promise<void>
  cancelWaitingListEntry: (id: number) => Promise<void>
  selectedAppointment: AppointmentType | null
  setSelectedAppointment: (appointment: AppointmentType | null) => void
  refreshAppointments: () => Promise<void>
}

// Create the context
const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined)

// Provider component
export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentType[]>([])
  const [pastAppointments, setPastAppointments] = useState<AppointmentType[]>([])
  const [waitingListEntries, setWaitingListEntries] = useState<WaitingListEntryType[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentType | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [screenWidth, setScreenWidth] = useState<number>(Dimensions.get('window').width)
  const [newAppointments, setNewAppointments] = useState<AppointmentType[]>([]) // Store newly created appointments
  const isSmallScreen = screenWidth < 768
  const platformOS = Platform.OS
  
  const { user } = useAuth()

  // Handle screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width)
    })
    return () => subscription?.remove()
  }, [])

  // Fetch appointments when the component mounts
  useEffect(() => {
    if (user?.id) {
      refreshAppointments()
    }
  }, [user?.id])

  // Helper to fetch all paginated results with improved error handling for cross-platform
  const fetchAllPaginated = async (fetchFn: (params: any) => Promise<any>, params: any = {}) => {
    let results: any[] = [];
    let page = 1;
    let hasNext = true;
    
    try {
      while (hasNext) {
        const resp = await fetchFn({ ...params, page });
        if (resp && Array.isArray(resp.results)) {
          results = results.concat(resp.results);
          hasNext = !!resp.next;
          page += 1;
        } else {
          hasNext = false;
        }
      }
      return results;
    } catch (error) {
      // Platform-specific error handling
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        console.error(`Mobile error fetching data: ${error}`);
      } else {
        console.error(`Web error fetching data: ${error}`);
      }
      return [];
    }
  };

  // Format date in a cross-platform safe way
  const formatDateSafely = (dateString: string, formatStr: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, formatStr);
    } catch (error) {
      console.warn(`Error formatting date: ${dateString}, using fallback`);
      return dateString;
    }
  };

  // Function to refresh all appointment data using mock data
  const refreshAppointments = async () => {
    setLoading(true)
    try {
      // Use mock data instead of API calls
      const currentUserId = user?.id || AZIZ_BAHLOUL.id;
      
      // Filter mock appointments for current user (Aziz Bahloul)
      const userAppointments = MOCK_APPOINTMENTS.filter(app => 
        app.patient.id === currentUserId || app.patient.id === AZIZ_BAHLOUL.id
      );
      
      console.log(`📊 Debug: Total appointments in system: ${MOCK_APPOINTMENTS.length}`);
      console.log(`📊 Debug: User appointments for ${currentUserId}: ${userAppointments.length}`);
      
      const now = new Date();
      
      // Separate upcoming and past appointments
      const upcomingMockApps = userAppointments.filter(app => {
        const appointmentDate = new Date(`${app.date} ${app.time}`);
        return appointmentDate >= now && ['pending', 'confirmed', 'scheduled'].includes(app.status);
      });
      
      console.log(`📅 Debug: Upcoming appointments found: ${upcomingMockApps.length}`);
      console.log(`📅 Debug: New appointments created: ${newAppointments.length}`);
      
      const pastMockApps = userAppointments.filter(app => {
        const appointmentDate = new Date(`${app.date} ${app.time}`);
        return appointmentDate < now || ['completed', 'cancelled'].includes(app.status);
      });
      
      // Map mock appointments to the expected AppointmentType format
      const upcoming = upcomingMockApps.map((appointment: any) => ({
        id: Number(appointment.id),
        appointment_id: String(appointment.id),
        therapist: appointment.therapist.full_name,
        patient: appointment.patient.full_name,
        appointment_date: `${appointment.date} ${appointment.time}`,
        date: formatDateSafely(`${appointment.date} ${appointment.time}`, 'MMMM d, yyyy'),
        time: formatDateSafely(`${appointment.date} ${appointment.time}`, 'h:mm a'),
        status: appointment.status.replace(/^./, (c: string) => c.toUpperCase()),
        isWithin15Min: isWithin15Minutes(`${appointment.date} ${appointment.time}`),
        is_upcoming: true,
        is_past: false,
        can_cancel: ['pending', 'confirmed'].includes(appointment.status),
        can_confirm: appointment.status === 'pending',
        can_complete: appointment.status === 'confirmed',
        notes: appointment.notes || undefined,
        duration: appointment.duration,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at,
        video_session_link: appointment.video_session_link,
        cancelled_by: undefined,
        cancelled_by_name: undefined,
        cancellation_reason: undefined,
        reminder_sent: false,
        original_date: undefined,
        reschedule_count: 0,
        last_rescheduled: undefined,
        rescheduled_by: undefined,
        rescheduled_by_name: undefined,
        pain_level: undefined,
      }))
      
      // Combine existing mock appointments with newly created ones
      const allUpcomingAppointments = [...upcoming, ...newAppointments.filter(app => app.is_upcoming)];
      setUpcomingAppointments(allUpcomingAppointments)

      // Map past appointments
      const past = pastMockApps.map((appointment: any) => ({
        id: Number(appointment.id),
        appointment_id: String(appointment.id),
        therapist: appointment.therapist.full_name,
        patient: appointment.patient.full_name,
        appointment_date: `${appointment.date} ${appointment.time}`,
        date: formatDateSafely(`${appointment.date} ${appointment.time}`, 'MMMM d, yyyy'),
        time: formatDateSafely(`${appointment.date} ${appointment.time}`, 'h:mm a'),
        status: appointment.status.replace(/^./, (c: string) => c.toUpperCase()),
        feedbackSubmitted: appointment.status === 'completed',
        is_upcoming: false,
        is_past: true,
        can_cancel: false,
        can_confirm: false,
        can_complete: false,
        notes: appointment.notes || "Session completed successfully",
        duration: appointment.duration,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at,
        video_session_link: appointment.video_session_link,
        cancelled_by: appointment.status === 'cancelled' ? 1 : undefined,
        cancelled_by_name: appointment.status === 'cancelled' ? appointment.patient.full_name : undefined,
        cancellation_reason: appointment.status === 'cancelled' ? 'Schedule conflict' : undefined,
        reminder_sent: true,
        original_date: undefined,
        reschedule_count: 0,
        last_rescheduled: undefined,
        rescheduled_by: undefined,
        rescheduled_by_name: undefined,
        pain_level: undefined,
      }))
      
      // Combine existing mock appointments with newly created ones
      const allPastAppointments = [...past, ...newAppointments.filter(app => app.is_past)];
      setPastAppointments(allPastAppointments)

      // Generate mock waiting list entries for Aziz Bahloul
      const waitingList = [
        {
          id: 1,
          therapist: 'Dr. Sonia Hamdi',
          requestedDate: formatDateSafely(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 'MMMM d, yyyy'),
          preferredTimeSlots: ['Morning', 'Afternoon'],
          status: 'Pending',
        },
        {
          id: 2,
          therapist: 'Dr. Ahmed Gharbi',
          requestedDate: formatDateSafely(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), 'MMMM d, yyyy'),
          preferredTimeSlots: ['Evening'],
          status: 'Notified',
        }
      ]
      setWaitingListEntries(waitingList)

    } catch (error) {
      console.error(`Error refreshing appointments on ${Platform.OS}:`, error)
    } finally {
      setLoading(false)
    }
  }

  // Add a new appointment using mock data
  const addAppointment = async (appointmentData: {
    therapist_id: number | string; // Allow both number and string IDs
    appointment_date: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      console.log('Creating new appointment with data:', appointmentData);
      
      // Find the therapist from mock data - handle both string and number IDs
      const therapist = MOCK_THERAPISTS.find(t => 
        t.id === appointmentData.therapist_id || 
        t.id === String(appointmentData.therapist_id)
      ) || MOCK_THERAPISTS[0];
      
      console.log(`👨‍⚕️ Debug: Selected therapist: ${therapist.full_name} (ID: ${therapist.id})`);
      
      // Parse the appointment date and time
      const appointmentDateTime = new Date(appointmentData.appointment_date);
      const now = new Date();
      
      // Check if the appointment date is in the future (should be upcoming)
      const isUpcoming = appointmentDateTime >= now;
      
      console.log(`📅 Debug: Appointment date: ${appointmentDateTime.toISOString()}`);
      console.log(`📅 Debug: Current date: ${now.toISOString()}`);
      console.log(`📅 Debug: Is appointment upcoming? ${isUpcoming}`);
      
      // Create new appointment object
      const newAppointment: AppointmentType = {
        id: Date.now(), // Use timestamp as unique ID
        appointment_id: String(Date.now()),
        therapist: therapist.full_name,
        patient: AZIZ_BAHLOUL.full_name,
        appointment_date: appointmentData.appointment_date,
        date: formatDateSafely(appointmentData.appointment_date, 'MMMM d, yyyy'),
        time: formatDateSafely(appointmentData.appointment_date, 'h:mm a'),
        status: 'Confirmed',
        isWithin15Min: false,
        is_upcoming: isUpcoming,
        is_past: !isUpcoming,
        can_cancel: isUpcoming,
        can_confirm: false,
        can_complete: false,
        notes: appointmentData.notes || 'New appointment booking',
        duration: 60,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        video_session_link: undefined,
        cancelled_by: undefined,
        cancelled_by_name: undefined,
        cancellation_reason: undefined,
        reminder_sent: false,
        original_date: undefined,
        reschedule_count: 0,
        last_rescheduled: undefined,
        rescheduled_by: undefined,
        rescheduled_by_name: undefined,
        pain_level: undefined,
        feedbackSubmitted: false,
      };
      
      console.log('📋 Debug: Created new appointment object:', newAppointment);
      
      // Add to the new appointments array
      setNewAppointments(prev => {
        const updated = [...prev, newAppointment];
        console.log(`📊 Debug: Total new appointments now: ${updated.length}`);
        return updated;
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh to show the updated list
      await refreshAppointments();
      
      console.log('✅ New appointment created successfully');
    } catch (error) {
      const errorMsg = Platform.OS === 'web' 
        ? "Error adding appointment in browser" 
        : `Error adding appointment on ${Platform.OS}`;
      console.error(`${errorMsg}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Cancel an appointment using mock data
  const cancelAppointment = async (id: number) => {
    try {
      // For demo purposes, simulate successful cancellation
      console.log('Demo: Cancelling appointment with ID:', id);
      
      // Simulate a delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would make an API call
      // For demo, we'll just refresh to show updated status
      await refreshAppointments();
    } catch (error) {
      console.error(`Error cancelling appointment on ${Platform.OS}:`, error)
      throw error
    }
  }

  // Reschedule an appointment using mock data
  const rescheduleAppointment = async (id: number, newDate: string, newTime: string) => {
    try {
      setLoading(true)
      
      // For demo purposes, simulate successful reschedule
      console.log('Demo: Rescheduling appointment:', { id, newDate, newTime });
      
      // Simulate a delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would make an API call
      // For demo, we'll just refresh to show updated appointments
      await refreshAppointments()
    } catch (error) {
      console.error(`Error rescheduling appointment on ${Platform.OS}:`, error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Submit feedback for an appointment using mock data
  const submitFeedback = async (id: number, rating: number, comment: string) => {
    try {
      // For demo purposes, simulate successful feedback submission
      console.log('Demo: Submitting feedback:', { id, rating, comment });
      
      // Simulate a delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would make an API call
      // For demo, we'll just refresh to show updated feedback status
      await refreshAppointments();
    } catch (error) {
      console.error(`Error submitting feedback on ${Platform.OS}:`, error)
      throw error
    }
  }

  // Add to waiting list using mock data
  const addToWaitingList = async (entryData: {
    therapist_id: number | string; // Allow both number and string IDs
    preferred_dates: string[];
    preferred_time_slots: string[];
    notes?: string;
  }) => {
    try {
      // For demo purposes, simulate successful waiting list addition
      console.log('Demo: Adding to waiting list:', entryData);
      
      // Find the therapist from mock data - handle both string and number IDs
      const therapist = MOCK_THERAPISTS.find(t => 
        t.id === entryData.therapist_id || 
        t.id === String(entryData.therapist_id)
      ) || MOCK_THERAPISTS[0];
      
      // Simulate a delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would make an API call
      // For demo, we'll just refresh to show updated waiting list
      await refreshAppointments();
    } catch (error) {
      console.error(`Error adding to waiting list on ${Platform.OS}:`, error)
      throw error
    }
  }

  // Cancel waiting list entry using mock data
  const cancelWaitingListEntry = async (id: number) => {
    try {
      // For demo purposes, simulate successful waiting list cancellation
      console.log('Demo: Cancelling waiting list entry with ID:', id);
      
      // Simulate a delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would make an API call
      // For demo, we'll just refresh to show updated waiting list
      await refreshAppointments();
    } catch (error) {
      console.error(`Error cancelling waiting list entry on ${Platform.OS}:`, error)
      throw error
    }
  }

  return (
    <AppointmentContext.Provider
      value={{
        upcomingAppointments,
        pastAppointments,
        waitingListEntries,
        loading,
        screenWidth,
        isSmallScreen,
        platformOS,
        addAppointment,
        cancelAppointment,
        rescheduleAppointment,
        submitFeedback,
        addToWaitingList,
        cancelWaitingListEntry,
        selectedAppointment,
        setSelectedAppointment,
        refreshAppointments,
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
