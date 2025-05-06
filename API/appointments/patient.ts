// API/patient.ts - Patient-specific APIs for appointments
import axios from 'axios';
import { API_URL } from '../../config';
import { getAuthToken } from '../../lib/utils';
import { 
  Appointment,
  PaginatedResponse,
  CreateAppointmentParams,
  AppointmentFilterParams,
  TimeSlot
} from './types';

/**
 * Format query parameters for API calls
 */
const formatQueryParams = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  return queryParams.toString() ? `?${queryParams.toString()}` : '';
};

/**
 * Get patient's upcoming appointments
 * @returns Promise with paginated upcoming appointments
 */
export const getUpcomingAppointments = async (): Promise<PaginatedResponse<Appointment>> => {
  try {
    const token = await getAuthToken();
    const filters = {
      status: 'confirmed',
      upcoming: true
    };
    const queryString = formatQueryParams(filters);
    
    const response = await axios.get(`${API_URL}/appointments/${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data as PaginatedResponse<Appointment>;
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    throw error;
  }
};

/**
 * Get patient's appointment history with optional filters
 * @param filters Optional filter parameters
 * @returns Promise with paginated appointments
 */
export const getAppointmentHistory = async (
  filters?: AppointmentFilterParams
): Promise<PaginatedResponse<Appointment>> => {
  try {
    const token = await getAuthToken();
    const queryString = filters ? formatQueryParams(filters) : '';
    
    const response = await axios.get(`${API_URL}/appointments/${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data as PaginatedResponse<Appointment>;
  } catch (error) {
    console.error('Error fetching appointment history:', error);
    throw error;
  }
};

/**
 * Book an appointment with a therapist
 * @param therapistId The therapist's ID
 * @param appointmentData Appointment details
 * @returns Promise with created appointment
 */
export const bookAppointment = async (
  therapistId: number,
  appointmentData: Omit<CreateAppointmentParams, 'therapist_id'>
): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    const payload = {
      ...appointmentData,
      therapist_id: therapistId
    };
    
    const response = await axios.post(`${API_URL}/therapist/profiles/${therapistId}/book-appointment/`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data as Appointment;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

/**
 * Cancel a patient's appointment (checks for 24-hour notice)
 * @param appointmentId The appointment ID
 * @returns Promise with cancelled appointment
 */
export const cancelPatientAppointment = async (appointmentId: number): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.post(`${API_URL}/appointments/${appointmentId}/cancel/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data as Appointment;
  } catch (error) {
    console.error(`Error cancelling appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Get a therapist's available time slots
 * @param therapistId The therapist's ID
 * @param date The date to check (YYYY-MM-DD)
 * @returns Promise with available time slots
 */
export const getTherapistAvailability = async (
  therapistId: number,
  date: string
): Promise<{ available_slots: TimeSlot[] }> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.get(
      `${API_URL}/therapist/profiles/${therapistId}/availability/?date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    return response.data as { available_slots: TimeSlot[] };
  } catch (error) {
    console.error(`Error fetching therapist ${therapistId} availability:`, error);
    throw error;
  }
};

/**
 * Reschedule a patient's appointment
 * @param appointmentId The appointment ID
 * @param newDate New appointment date and time
 * @returns Promise with updated appointment
 */
export const rescheduleAppointment = async (
  appointmentId: number,
  newDate: string
): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.patch(
      `${API_URL}/appointments/${appointmentId}/`,
      { appointment_date: newDate },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    return response.data as Appointment;
  } catch (error) {
    console.error(`Error rescheduling appointment ${appointmentId}:`, error);
    throw error;
  }
};