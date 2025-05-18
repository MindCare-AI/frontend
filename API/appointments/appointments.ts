// API/appointments.ts - All Appointment-related APIs
import axios from 'axios';
import { API_URL } from '../../config';
import { getAuthToken } from '../../lib/utils';
import { 
  Appointment, 
  AppointmentFilterParams,
  PaginatedResponse,
  CreateAppointmentParams,
  Feedback,
  FeedbackParams
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
 * Get all appointments with optional filters
 * @param filters Optional filter parameters
 * @returns Promise with paginated appointments
 */
export const getAppointments = async (
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
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

/**
 * Get a specific appointment by ID
 * @param id The appointment ID
 * @returns Promise with appointment data
 */
export const getAppointment = async (id: number): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.get(`${API_URL}/appointments/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data as Appointment;
  } catch (error) {
    console.error(`Error fetching appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new appointment
 * @param appointmentData The appointment data
 * @returns Promise with created appointment
 */
export const createAppointment = async (
  appointmentData: CreateAppointmentParams
): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.post(`${API_URL}/appointments/`, appointmentData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data as Appointment;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

/**
 * Update an existing appointment
 * @param id The appointment ID
 * @param appointmentData The data to update
 * @returns Promise with updated appointment
 */
export const updateAppointment = async (
  id: number, 
  appointmentData: Partial<Appointment>
): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.patch(`${API_URL}/appointments/${id}/`, appointmentData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data as Appointment;
  } catch (error) {
    console.error(`Error updating appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an appointment
 * @param id The appointment ID
 * @returns Promise with deletion status
 */
export const deleteAppointment = async (id: number): Promise<void> => {
  try {
    const token = await getAuthToken();
    
    await axios.delete(`${API_URL}/appointments/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  } catch (error) {
    console.error(`Error deleting appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Cancel an appointment
 * @param id The appointment ID
 * @returns Promise with updated appointment
 */
export const cancelAppointment = async (id: number): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.post(`${API_URL}/appointments/${id}/cancel/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data as Appointment;
  } catch (error) {
    console.error(`Error cancelling appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Confirm an appointment (therapist only)
 * @param id The appointment ID
 * @returns Promise with updated appointment
 */
export const confirmAppointment = async (id: number): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.post(`${API_URL}/appointments/${id}/confirm/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data as Appointment;
  } catch (error) {
    console.error(`Error confirming appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Mark an appointment as completed (therapist only)
 * @param id The appointment ID
 * @returns Promise with updated appointment
 */
export const completeAppointment = async (id: number): Promise<Appointment> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.post(`${API_URL}/appointments/${id}/complete/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data as Appointment;
  } catch (error) {
    console.error(`Error completing appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Submit feedback for an appointment
 * @param params The feedback parameters
 * @returns Promise with submitted feedback
 */
export const submitFeedback = async (params: FeedbackParams): Promise<Feedback> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.post(
      `${API_URL}/appointments/${params.appointment_id}/feedback/`, 
      { rating: params.rating, comments: params.comments },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    return response.data as Feedback;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

/**
 * Get feedback for a specific appointment
 * @param appointmentId The appointment ID
 * @returns Promise with feedback data
 */
export const getFeedback = async (appointmentId: number): Promise<Feedback> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.get(
      `${API_URL}/appointments/${appointmentId}/feedback/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    return response.data as Feedback;
  } catch (error) {
    console.error(`Error fetching feedback for appointment ${appointmentId}:`, error);
    throw error;
  }
};