// API/therapist.ts - Therapist-specific APIs for appointments
import axios from 'axios';
import { API_URL } from '../../config';
import { getAuthToken } from '../../lib/utils';
import { 
  Appointment,
  PaginatedResponse,
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
 * Get all appointments for a therapist with optional filters
 * @param filters Optional filter parameters
 * @returns Promise with paginated appointments
 */
export const getTherapistAppointments = async (
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
    console.error('Error fetching therapist appointments:', error);
    throw error;
  }
};

/**
 * Set therapist's weekly availability
 * @param availableDays Map of day name to array of time slots
 * @returns Promise with updated availability
 */
export const setTherapistAvailability = async (
  availableDays: Record<string, TimeSlot[]>,
  videoSessionLink?: string
): Promise<any> => {
  try {
    const token = await getAuthToken();
    
    // Format payload for the API
    const payload: any = { available_days: availableDays };
    if (videoSessionLink) {
      payload.video_session_link = videoSessionLink;
    }
    
    const response = await axios.patch(
      `${API_URL}/therapist/profiles/availability/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error setting therapist availability:', error);
    throw error;
  }
};

/**
 * Get therapist's current availability settings
 * @returns Promise with current availability settings
 */
export const getTherapistAvailabilitySettings = async (): Promise<any> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.get(`${API_URL}/therapist/profiles/availability/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching therapist availability settings:', error);
    throw error;
  }
};

/**
 * Update the therapist's profile with a new video session link
 * @param videoSessionLink The new video session link
 * @returns Promise with updated profile
 */
export const updateVideoSessionLink = async (videoSessionLink: string): Promise<any> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.patch(
      `${API_URL}/therapist/profiles/`,
      { video_session_link: videoSessionLink },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating video session link:', error);
    throw error;
  }
};

/**
 * Confirm an appointment request (therapist only)
 * @param appointmentId The appointment ID
 * @returns Promise with updated appointment
 */
export const confirmAppointmentRequest = async (appointmentId: number): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.post(
      `${API_URL}/appointments/${appointmentId}/confirm/`,
      {},
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
    console.error(`Error confirming appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Mark an appointment as completed (therapist only)
 * @param appointmentId The appointment ID
 * @returns Promise with updated appointment
 */
export const completeAppointment = async (appointmentId: number): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.post(
      `${API_URL}/appointments/${appointmentId}/complete/`,
      {},
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
    console.error(`Error completing appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Cancel an appointment as a therapist
 * @param appointmentId The appointment ID
 * @returns Promise with updated appointment
 */
export const cancelTherapistAppointment = async (appointmentId: number): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.post(
      `${API_URL}/appointments/${appointmentId}/cancel/`,
      {},
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
    console.error(`Error cancelling appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Check waiting list entries that match therapist's availability
 * @returns Promise with matching waiting list entries
 */
export const checkWaitingListMatches = async (): Promise<any> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.get(
      `${API_URL}/appointments/waiting-list/check-availability/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error checking waiting list matches:', error);
    throw error;
  }
};