import axios from "axios";
import { API_URL } from "../../config";
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppointmentResponse } from "types/appoint_therapist";
import { MOCK_APPOINTMENTS, MOCK_THERAPISTS, SLIMEN_ABYADH } from '../../data/tunisianMockData';

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
  // MOCK IMPLEMENTATION - Returns mock appointments for therapist
  console.log("[therapist.ts] Mock getAppointments called with params:", params);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Filter appointments for current therapist (using Slimen Abyadh as the main therapist)
  const therapistId = SLIMEN_ABYADH.id;
  const therapistAppointments = MOCK_APPOINTMENTS.filter(apt => 
    apt.therapist.id === therapistId
  );
  
  console.log(`[therapist.ts] Debug: Total mock appointments: ${MOCK_APPOINTMENTS.length}`);
  console.log(`[therapist.ts] Debug: Therapist appointments: ${therapistAppointments.length}`);
  
  // Transform to expected format for therapist dashboard
  const results = therapistAppointments.map(apt => ({
    id: apt.id,
    appointment_date: apt.date, // Use the date field
    appointment_id: apt.id.toString(),
    patient_name: apt.patient.full_name,
    patientName: apt.patient.full_name, // Add both formats for compatibility
    patientId: apt.patient.id,
    time: apt.time,
    date: apt.date,
    status: apt.status,
    notes: apt.notes || "No notes available",
    video_session_link: apt.video_session_link || "https://meet.google.com/abc-defg-hij",
    confirmed_by: apt.status === 'confirmed' ? 'Dr. Slimen Abyadh' : undefined,
    confirmation_date: apt.status === 'confirmed' ? new Date().toISOString() : undefined,
    completed_by: apt.status === 'completed' ? 'Dr. Slimen Abyadh' : undefined,
    completion_date: apt.status === 'completed' ? new Date().toISOString() : undefined,
  }));
  
  return {
    results,
    count: results.length,
    next: null,
    previous: null
  };
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
  // MOCK IMPLEMENTATION - Always succeeds
  console.log(`[therapist.ts] Mock rescheduleAppointment called: ${appointmentId} to ${appointmentDate}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Return mock updated appointment
  return {
    id: appointmentId,
    appointment_id: appointmentId.toString(),
    appointment_date: appointmentDate,
    patient_name: "Aziz Bahloul",
    status: "rescheduled",
    notes: notes || "Appointment rescheduled by therapist",
    updated_at: new Date().toISOString(),
    video_session_link: "https://meet.google.com/abc-defg-hij",
  };
};

/**
 * Confirms an appointment
 * @param appointmentId - The ID of the appointment to confirm
 * @returns The confirmed appointment data
 */
export const confirmAppointment = async (appointmentId: number | string) => {
  // MOCK IMPLEMENTATION - Always succeeds
  console.log(`[therapist.ts] Mock confirmAppointment called: ${appointmentId}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock confirmed appointment
  return {
    id: appointmentId,
    appointment_id: appointmentId.toString(),
    patient_name: "Aziz Bahloul",
    status: "confirmed",
    confirmed_by: "Dr. Slimen Abyadh",
    confirmation_date: new Date().toISOString(),
    notes: "Appointment confirmed by therapist",
    video_session_link: "https://meet.google.com/abc-defg-hij",
  };
};

/**
 * Cancels an existing appointment
 * @param id - The ID of the appointment to cancel
 * @returns The canceled appointment data
 * 
 * Status Change: any status → canceled
 */
export const cancelAppointment = async (id: number) => {
  // MOCK IMPLEMENTATION - Always succeeds
  console.log(`[therapist.ts] Mock cancelAppointment called: ${id}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 900));
  
  // Return mock cancelled appointment
  return {
    id: id,
    appointment_id: id.toString(),
    patient_name: "Aziz Bahloul",
    status: "cancelled",
    cancelled_by: "Dr. Slimen Abyadh",
    cancellation_date: new Date().toISOString(),
    notes: "Appointment cancelled by therapist",
  };
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
  // MOCK IMPLEMENTATION - Always succeeds
  console.log(`[therapist.ts] Mock completeAppointment called: ${appointmentId}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return mock completed appointment
  return {
    id: appointmentId,
    appointment_id: appointmentId.toString(),
    patient_name: "Aziz Bahloul",
    status: "completed",
    completed_by: "Dr. Slimen Abyadh",
    completion_date: new Date().toISOString(),
    notes: "Session completed successfully",
    duration: "60 minutes",
  };
};