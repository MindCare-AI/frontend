import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URLs for therapist appointment endpoints
const APPOINTMENTS_URL = `${API_URL}/appointments`;
const THERAPIST_URL = `${API_URL}/therapist`;
const WAITING_LIST_URL = `${API_URL}/appointments/waiting-list`;

/**
 * Get appointments for the current therapist
 * @param params Query parameters (today, upcoming, status, etc.)
 */
export const getTherapistAppointments = async (params = {}) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.get(`${THERAPIST_URL}/appointments/`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching therapist appointments:', error);
    throw error;
  }
};

/**
 * Confirm an appointment
 */
export const confirmAppointment = async (appointmentId: number) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.post(
      `${APPOINTMENTS_URL}/${appointmentId}/confirm/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error confirming appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Complete an appointment
 */
export const completeAppointment = async (appointmentId: number) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.post(
      `${APPOINTMENTS_URL}/${appointmentId}/complete/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error completing appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Reschedule an appointment
 */
export const rescheduleAppointment = async (
  appointmentId: number,
  newDateTime: string
) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.post(
      `${APPOINTMENTS_URL}/${appointmentId}/reschedule/`,
      { new_appointment_date: newDateTime },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error rescheduling appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Get session notes
 */
export const getSessionNotes = async (params = {}) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.get(`${THERAPIST_URL}/session-notes/`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching session notes:', error);
    throw error;
  }
};

/**
 * Create session note
 */
export const createSessionNote = async (noteData: {
  patient: number;
  appointment?: number;
  notes: string;
  session_date?: string;
}) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.post(
      `${THERAPIST_URL}/session-notes/`,
      noteData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating session note:', error);
    throw error;
  }
};

/**
 * Update session note
 */
export const updateSessionNote = async (noteId: number, noteData: {
  notes: string;
  session_date?: string;
}) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.patch(
      `${THERAPIST_URL}/session-notes/${noteId}/`,
      noteData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error updating session note ${noteId}:`, error);
    throw error;
  }
};

/**
 * Get therapist's waiting list
 */
export const getTherapistWaitingList = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.get(`${THERAPIST_URL}/waiting-list/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching therapist waiting list:', error);
    throw error;
  }
};

/**
 * Notify a patient from waiting list
 */
export const notifyWaitingListPatient = async (entryId: number) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.post(
      `${WAITING_LIST_URL}/${entryId}/notify/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error notifying waiting list patient ${entryId}:`, error);
    throw error;
  }
};

/**
 * Update therapist availability
 */
export const updateTherapistAvailability = async (availabilityData: {
  day_of_week: string;
  start_time: string;
  end_time: string;
}) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.post(
      `${THERAPIST_URL}/availability/`,
      availabilityData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating therapist availability:', error);
    throw error;
  }
};

/**
 * Delete therapist availability slot
 */
export const deleteAvailabilitySlot = async (slotId: number) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.delete(
      `${THERAPIST_URL}/availability/${slotId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error deleting availability slot ${slotId}:`, error);
    throw error;
  }
};