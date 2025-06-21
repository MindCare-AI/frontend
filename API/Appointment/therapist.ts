import axios from "axios";
import { API_URL } from "../../config";
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppointmentResponse } from "types/appoint_therapist";

/**
 * Appointment Status Flow:
 * 
 * 1. pending - Initial state when appointment is first created
 * 2. confirmed - After therapist confirms the appointment
 * 3. completed - After therapist marks the appointment as completed
 * 
 * Note: Appointments can also be canceled or rescheduled at various stages
 */

// Helper to get auth headers with cross-platform storage
const getAuthHeaders = async () => {
  let token;
  
  if (Platform.OS === 'web') {
    // Use localStorage for web
    token = localStorage.getItem("accessToken");
  } else {
    // Use AsyncStorage for mobile (iOS/Android)
    token = await AsyncStorage.getItem("accessToken");
  }
  
  console.log("[therapist.ts] Auth token used:", token);
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// --- Appointment APIs ---

export const getAppointments = async (params: any = {}) => {
  try {
    const headers = await getAuthHeaders();
    // Use the correct appointments endpoint from backend
    const response = await axios.get(`${API_URL}/appointments/`, {
      headers,
      params,
    });
    
    console.log("[therapist.ts] getAppointments response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("[therapist.ts] Error fetching appointments:", error);
    // Return empty data instead of throwing to prevent app crashes
    return { results: [], count: 0 };
  }
};

/**
 * Reschedules an existing appointment
 * @param appointmentId - The ID of the appointment to reschedule
 * @param appointmentDate - New date and time (format: YYYY-MM-DD HH:MM)
 * @param notes - Optional notes about why the appointment was rescheduled
 * @returns The updated appointment data
 */
export const rescheduleAppointment = async (
  appointmentId: number | string,
  appointmentDate: string,
  notes?: string
) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/appointments/${appointmentId}/`, {
      appointment_date: appointmentDate,
      notes: notes,
    }, {
      headers,
    });
    
    console.log(`[therapist.ts] rescheduleAppointment response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[therapist.ts] Error rescheduling appointment:`, error);
    throw error;
  }
};

/**
 * Confirms an appointment
 * @param appointmentId - The ID of the appointment to confirm
 * @returns The confirmed appointment data
 */
export const confirmAppointment = async (appointmentId: number | string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/appointments/${appointmentId}/confirm/`, {}, {
      headers,
    });
    
    console.log(`[therapist.ts] confirmAppointment response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[therapist.ts] Error confirming appointment:`, error);
    throw error;
  }
};

/**
 * Cancels an existing appointment
 * @param id - The ID of the appointment to cancel
 * @returns The canceled appointment data
 * 
 * Status Change: any status → canceled
 */
export const cancelAppointment = async (id: number) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/appointments/${id}/cancel/`, {}, {
      headers,
    });
    
    console.log(`[therapist.ts] cancelAppointment response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[therapist.ts] Error cancelling appointment:`, error);
    throw error;
  }
};

/**
 * Marks an appointment as completed
 * @param appointmentId - The ID of the appointment to mark as completed
 * @returns The completed appointment data
 * 
 * Note: Only verified therapists can complete appointments that are in 'confirmed' status.
 * Once completed, the appointment cannot be modified further.
 * 
 * Status Change: confirmed → completed
 */
export const completeAppointment = async (appointmentId: number | string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/appointments/${appointmentId}/complete/`, {}, {
      headers,
    });
    
    console.log(`[therapist.ts] completeAppointment response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[therapist.ts] Error completing appointment:`, error);
    throw error;
  }
};