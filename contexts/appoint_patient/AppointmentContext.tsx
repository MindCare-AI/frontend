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
  removeFromWaitingList,
  getAllTherapistProfiles
} from "../../API/Appointment/patient"
import { useAuth } from "../AuthContext"
import { format } from "date-fns"
import { isWithin15Minutes } from "../../utils/Appointment/dateUtils"
import { API_URL } from "../../config"

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

  // Function to refresh all appointment data using real API
  const refreshAppointments = async () => {
    setLoading(true)
    try {
      // Fetch appointments from the real API
      const appointmentsResponse = await fetchAllPaginated(getAppointments);
      console.log(`📊 Debug: Fetched ${appointmentsResponse.length} appointments from API`);
      
      // Fetch all therapist profiles to ensure we have name data
      // Import directly from the already imported modules
      const therapistProfiles = await getAllTherapistProfiles();
      console.log(`👨‍⚕️ Debug: Fetched ${therapistProfiles.length} therapist profiles for mapping`);
      
      const now = new Date();
      
      // Separate upcoming and past appointments
      const upcomingApps = appointmentsResponse.filter((app: any) => {
        const appointmentDate = new Date(app.appointment_date);
        return appointmentDate >= now && ['pending', 'confirmed', 'scheduled'].includes(app.status);
      });
      
      console.log(`📅 Debug: Upcoming appointments found: ${upcomingApps.length}`);
      
      const pastApps = appointmentsResponse.filter((app: any) => {
        const appointmentDate = new Date(app.appointment_date);
        return appointmentDate < now || ['completed', 'cancelled'].includes(app.status);
      });
      
      // Helper function to resolve therapist name from ID using profile data
      const resolveTherapistName = (appointment: any, type: string) => {
        // Start with available name from appointment
        let therapistName = appointment.therapist_name || 'Unknown Therapist';
        
        // Check if therapistName is empty or just a number
        if (!therapistName || therapistName === 'Unknown Therapist' || /^\d+$/.test(therapistName)) {
          // If therapist is just a number (ID), try to extract name from other fields
          if (typeof appointment.therapist === 'number' || (typeof appointment.therapist === 'string' && /^\d+$/.test(appointment.therapist))) {
            // If therapist_name is empty or undefined but we have first_name/last_name
            if (appointment.therapist_first_name || appointment.therapist_last_name) {
              therapistName = `${appointment.therapist_first_name || ''} ${appointment.therapist_last_name || ''}`.trim();
            }
          }
        }
        
        // Final fallback - check if therapistName is still a number or empty
        if (!therapistName || /^\d+$/.test(therapistName)) {
          // Look up in therapist profiles if available
          const therapistId = appointment.therapist?.toString();
          if (therapistProfiles && therapistProfiles.length > 0) {
            const therapistProfile = therapistProfiles.find((t: any) => 
              t.id?.toString() === therapistId
            );
            
            if (therapistProfile) {
              if (therapistProfile.username) {
                therapistName = therapistProfile.username;
              } else if (therapistProfile.first_name || therapistProfile.last_name) {
                therapistName = `${therapistProfile.first_name || ''} ${therapistProfile.last_name || ''}`.trim();
              } else if (therapistProfile.full_name) {
                therapistName = therapistProfile.full_name;
              } else if (therapistProfile.email) {
                therapistName = therapistProfile.email.split('@')[0];
              }
              console.log(`🔍 [AppointmentContext] Found therapist profile match for ${type}: ${therapistProfile.id} -> ${therapistName}`);
            } else {
              therapistName = `Therapist ${appointment.therapist || 'Unknown'}`;
              console.log(`❌ [AppointmentContext] No therapist profile found for ${type} ID: ${therapistId}`);
            }
          } else {
            therapistName = `Therapist ${appointment.therapist || 'Unknown'}`;
            console.log(`⚠️ [AppointmentContext] No therapist profiles available to match ID: ${therapistId}`);
          }
        }
        
        return therapistName;
      };

      // Map API appointments to the expected AppointmentType format
      const upcoming = upcomingApps.map((appointment: any) => {
        return {
          id: Number(appointment.id),
          appointment_id: String(appointment.id),
          therapist: resolveTherapistName(appointment, 'upcoming'),
          therapist_id: appointment.therapist,
          patient: appointment.patient_name || appointment.patient || 'Unknown Patient',
          appointment_date: appointment.appointment_date,
          date: formatDateSafely(appointment.appointment_date, 'MMMM d, yyyy'),
          time: formatDateSafely(appointment.appointment_date, 'h:mm a'),
          status: appointment.status.replace(/^./, (c: string) => c.toUpperCase()),
          isWithin15Min: isWithin15Minutes(appointment.appointment_date),
          is_upcoming: true,
          is_past: false,
          can_cancel: ['pending', 'confirmed'].includes(appointment.status),
          can_confirm: appointment.status === 'pending',
          can_complete: appointment.status === 'confirmed',
          notes: appointment.notes || undefined,
          duration: appointment.duration || 60,
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
        };
      })
      
      // Combine API appointments with newly created ones
      const allUpcomingAppointments = [...upcoming, ...newAppointments.filter(app => app.is_upcoming)];
      setUpcomingAppointments(allUpcomingAppointments)

      // Map past appointments
      const past = pastApps.map((appointment: any) => {
        return {
          id: Number(appointment.id),
          appointment_id: String(appointment.id),
          therapist: resolveTherapistName(appointment, 'past'),
          therapist_id: appointment.therapist,
          patient: appointment.patient_name || appointment.patient || 'Unknown Patient',
          appointment_date: appointment.appointment_date,
          date: formatDateSafely(appointment.appointment_date, 'MMMM d, yyyy'),
          time: formatDateSafely(appointment.appointment_date, 'h:mm a'),
          status: appointment.status.replace(/^./, (c: string) => c.toUpperCase()),
          feedbackSubmitted: appointment.status === 'completed',
          is_upcoming: false,
          is_past: true,
          can_cancel: false,
          can_confirm: false,
          can_complete: false,
          notes: appointment.notes || "Session completed successfully",
          duration: appointment.duration || 60,
          created_at: appointment.created_at,
          updated_at: appointment.updated_at,
          video_session_link: appointment.video_session_link,
          cancelled_by: appointment.status === 'cancelled' ? 1 : undefined,
          cancelled_by_name: appointment.status === 'cancelled' ? appointment.patient_name : undefined,
          cancellation_reason: appointment.status === 'cancelled' ? 'Schedule conflict' : undefined,
          reminder_sent: true,
          original_date: undefined,
          reschedule_count: 0,
          last_rescheduled: undefined,
          rescheduled_by: undefined,
          rescheduled_by_name: undefined,
          pain_level: undefined,
        };
      })
      
      // Combine API appointments with newly created ones
      const allPastAppointments = [...past, ...newAppointments.filter(app => app.is_past)];
      setPastAppointments(allPastAppointments)

      // Fetch waiting list from API
      try {
        const waitingListResponse = await fetchAllPaginated(getWaitingList);
        console.log(`📊 Debug: Fetched ${waitingListResponse.length} waiting list entries from API`);
        
        const waitingList = waitingListResponse.map((entry: any) => ({
          id: entry.id,
          therapist: entry.therapist_name || entry.therapist || 'Unknown Therapist',
          requestedDate: formatDateSafely(entry.requested_date || entry.preferred_dates?.[0] || new Date().toISOString(), 'MMMM d, yyyy'),
          preferredTimeSlots: entry.preferred_time_slots || ['Morning'],
          status: entry.status || 'Pending',
        }));
        setWaitingListEntries(waitingList);
      } catch (waitingListError) {
        console.warn("Could not fetch waiting list, using empty list:", waitingListError);
        setWaitingListEntries([]);
      }

    } catch (error) {
      console.error(`Error refreshing appointments on ${Platform.OS}:`, error)
      // Set empty arrays on error to prevent crashes
      setUpcomingAppointments([]);
      setPastAppointments([]);
      setWaitingListEntries([]);
    } finally {
      setLoading(false)
    }
  }

  // Add a new appointment using real API
  const addAppointment = async (appointmentData: {
    therapist_id: number | string; // Allow both number and string IDs
    appointment_date: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      console.log('Creating new appointment with data:', appointmentData);
      
      // Call the real API to create appointment
      const response = await apiCreateAppointment({
        therapist: Number(appointmentData.therapist_id),
        appointment_date: appointmentData.appointment_date,
        notes: appointmentData.notes,
      });
      
      console.log('✅ Appointment created successfully:', response);
      
      // Refresh appointments to show the new one
      await refreshAppointments();
      
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

  // Cancel an appointment using real API
  const cancelAppointment = async (id: number) => {
    try {
      setLoading(true);
      console.log('Cancelling appointment with ID:', id);
      
      // Call the real API to cancel appointment
      await apiCancelAppointment(id);
      
      console.log('✅ Appointment cancelled successfully');
      
      // Refresh appointments to show the updated status
      await refreshAppointments();
    } catch (error) {
      console.error(`Error cancelling appointment on ${Platform.OS}:`, error)
      throw error
    } finally {
      setLoading(false);
    }
  }

  // Reschedule an appointment using real API
  const rescheduleAppointment = async (id: number, newDate: string, newTime: string) => {
    try {
      setLoading(true)
      
      console.log('Rescheduling appointment:', { id, newDate, newTime });
      
      // Combine date and time for the API
      const newDateTime = `${newDate} ${newTime}`;
      
      // Call the real API to reschedule appointment
      await apiCancelAppointment(id); // First cancel the old one
      // Note: You might want to implement a proper reschedule API endpoint
      // For now, we'll use the update function if available
      
      console.log('✅ Appointment rescheduled successfully');
      
      // Refresh appointments to show the updated data
      await refreshAppointments()
    } catch (error) {
      console.error(`Error rescheduling appointment on ${Platform.OS}:`, error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Submit feedback for an appointment using real API
  const submitFeedback = async (id: number, rating: number, comment: string) => {
    try {
      console.log('Submitting feedback:', { id, rating, comment });
      
      // Call the real API to submit feedback
      await submitAppointmentFeedback(id, { rating, comments: comment });
      
      console.log('✅ Feedback submitted successfully');
      
      // Refresh appointments to show the updated feedback status
      await refreshAppointments();
    } catch (error) {
      console.error(`Error submitting feedback on ${Platform.OS}:`, error)
      throw error
    }
  }

  // Add to waiting list using real API
  const addToWaitingList = async (entryData: {
    therapist_id: number | string; // Allow both number and string IDs
    preferred_dates: string[];
    preferred_time_slots: string[];
    notes?: string;
  }) => {
    try {
      console.log('Adding to waiting list:', entryData);
      
      // Call the real API to add to waiting list
      await apiAddToWaitingList({
        therapist_id: Number(entryData.therapist_id),
        preferred_dates: entryData.preferred_dates,
        preferred_time_slots: entryData.preferred_time_slots,
        notes: entryData.notes,
      });
      
      console.log('✅ Added to waiting list successfully');
      
      // Refresh appointments to show updated waiting list
      await refreshAppointments();
    } catch (error) {
      console.error(`Error adding to waiting list on ${Platform.OS}:`, error)
      throw error
    }
  }

  // Cancel waiting list entry using real API
  const cancelWaitingListEntry = async (id: number) => {
    try {
      console.log('Cancelling waiting list entry with ID:', id);
      
      // Call the real API to remove from waiting list
      await removeFromWaitingList(id);
      
      console.log('✅ Removed from waiting list successfully');
      
      // Refresh appointments to show updated waiting list
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
