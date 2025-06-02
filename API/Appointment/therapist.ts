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
  console.log("[therapist.ts] getAppointments params:", params);
  const url = `${API_URL}/appointments/`;
  console.log("[therapist.ts] getAppointments URL:", url);

  // Make a simple request without any filters
  const resp = await axios.get(url, {
    headers: await getAuthHeaders()
  });
  console.log("[therapist.ts] Appointments response:", resp.data);

  return resp.data;
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
  console.log(`[therapist.ts] Rescheduling appointment ${appointmentId} to ${appointmentDate}`);
  
  const url = `${API_URL}/appointments/${appointmentId}/`;
  console.log("[therapist.ts] Reschedule URL:", url);
  
  const requestBody = {
    appointment_date: appointmentDate,
    notes: notes || "Appointment rescheduled"
  };
  
  try {
    const response = await axios.patch(url, requestBody, {
      headers: await getAuthHeaders()
    });
    console.log("[therapist.ts] Reschedule response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("[therapist.ts] Reschedule error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Confirms an appointment
 * @param appointmentId - The ID of the appointment to confirm
 * @returns The confirmed appointment data
 */
export const confirmAppointment = async (appointmentId: number | string) => {
  console.log(`[therapist.ts] Confirming appointment ${appointmentId}`);
  
  const url = `${API_URL}/appointments/${appointmentId}/confirm/`;
  console.log("[therapist.ts] Confirm URL:", url);
  
  try {
    const response = await axios.post<AppointmentResponse>(url, {}, {
      headers: await getAuthHeaders()
    });
    console.log("[therapist.ts] Confirm response:", response.data);
    // Ensure we return the appointment data in a consistent format
    return response.data.appointment_id || response.data;
  } catch (error: any) {
    console.error("[therapist.ts] Confirm error:", error.response?.data || error.message);
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
  console.log(`[therapist.ts] Canceling appointment ${id}`);
  
  const url = `${API_URL}/appointments/${id}/cancel/`;
  console.log("[therapist.ts] Cancel URL:", url);
  
  try {
    const resp = await axios.post(
      url,
      {},
      { headers: await getAuthHeaders() }
    );
    console.log("[therapist.ts] Cancel response:", resp.data);
    return resp.data;
  } catch (error: any) {
    console.error("[therapist.ts] Cancel error:", error.response?.data || error.message);
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
  console.log(`[therapist.ts] Completing appointment ${appointmentId}`);
  
  const url = `${API_URL}/appointments/${appointmentId}/complete/`;
  console.log("[therapist.ts] Complete URL:", url);
  
  try {
    const response = await axios.post(url, {}, {
      headers: await getAuthHeaders()
    });
    console.log("[therapist.ts] Complete response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("[therapist.ts] Complete error:", error.response?.data || error.message);
    throw error;
  }
};