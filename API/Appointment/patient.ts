import axios from "axios";
import { API_URL } from "../../config";
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
  console.log("Auth token used:", token);
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// --- Appointment APIs ---

export const getAppointments = async (params: any = {}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/appointments/`, {
      headers,
      params,
    });
    
    console.log("getAppointments response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

interface UserProfile {
  id: number;
  username: string;
  email: string;
  user_type: string;
  phone_number: string | null;
  date_of_birth: string | null;
  preferences: {
    dark_mode: boolean;
    language: string;
    email_notifications: boolean;
    in_app_notifications: boolean;
    disabled_notification_types: string[];
    notification_preferences: any;
  };
  settings: any;
  therapist_profile: any;
  profile_id: number;
}

interface ApiError {
  response?: {
    data: unknown;
  };
  message: string;
}

export const createAppointment = async (data: {
  therapist: number;
  appointment_date: string;
  duration?: string;
  notes?: string;
}) => {
  try {
    const headers = await getAuthHeaders();
    
    // Get current patient profile ID
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    interface UserProfileData {
      profile_id: string | number;
      [key: string]: any;
    }
    
    const userResponse = await axios.get<UserProfileData>(`${API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!userResponse.data.profile_id) {
      throw new Error('Patient profile ID not found');
    }
    
    // Add patient ID to the appointment data
    const appointmentData = {
      ...data,
      patient: parseInt(userResponse.data.profile_id.toString())
    };
    
    console.log("Creating appointment with data:", appointmentData);
    
    const response = await axios.post(`${API_URL}/appointments/`, appointmentData, {
      headers,
    });
    
    console.log("createAppointment response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

export const cancelAppointment = async (id: number) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${API_URL}/appointments/${id}/`, {
      headers,
    });
    
    console.log("cancelAppointment response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
};

export const submitAppointmentFeedback = async (
  id: number,
  data: { rating: number; comments: string }
) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/appointments/${id}/feedback/`, data, {
      headers,
    });
    
    console.log("submitAppointmentFeedback response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error submitting appointment feedback:", error);
    throw error;
  }
};

export const rescheduleAppointment = async (id: number, data: {
  appointment_date: string;
  notes?: string;
}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/appointments/${id}/`, data, {
      headers,
    });
    
    console.log("rescheduleAppointment response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error rescheduling appointment:", error);
    throw error;
  }
};

export async function updateAppointmentDate(appointmentId: number, newDate: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/appointments/${appointmentId}/`, {
      appointment_date: newDate
    }, {
      headers,
    });
    
    console.log("updateAppointmentDate response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating appointment date:", error);
    throw error;
  }
}

// --- Waiting List APIs ---

export const getWaitingList = async (params: any = {}) => {
  try {
    const headers = await getAuthHeaders();
    // Use the correct waiting list endpoint based on backend structure
    const response = await axios.get(`${API_URL}/appointments/waiting-list/`, {
      headers,
      params,
    });
    
    console.log("getWaitingList response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching waiting list:", error);
    // Return empty data instead of throwing to prevent app crashes
    return { results: [], count: 0 };
  }
};

export const addToWaitingList = async (data: {
  therapist_id: number;
  preferred_dates: string[];
  preferred_time_slots: string[];
  notes?: string;
}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/waiting-list/`, data, {
      headers,
    });
    
    console.log("addToWaitingList response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error adding to waiting list:", error);
    throw error;
  }
};

export const removeFromWaitingList = async (id: number) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${API_URL}/waiting-list/${id}/`, {
      headers,
    });
    
    console.log("removeFromWaitingList response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error removing from waiting list:", error);
    throw error;
  }
};

// Therapist booking APIs

// Get available therapists for booking
export const getAvailableTherapistsForBooking = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/therapist/profiles/available/`, {
      headers,
    });
    
    console.log("getAvailableTherapistsForBooking response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error getting available therapists:", error);
    throw error;
  }
};

// Get therapist dropdown options for booking form
export const getTherapistDropdownOptions = async () => {
  try {
    const headers = await getAuthHeaders();
    // Use the correct working endpoint that returns all therapist profiles
    const response = await axios.get(`${API_URL}/therapist/profiles/all/`, {
      headers,
    });
    
    console.log("getTherapistDropdownOptions response:", response.data);
    
    // The backend returns an array directly, so we need to format it for frontend use
    const therapists = Array.isArray(response.data) ? response.data : [];
    
    // Filter therapists with availability and return in expected format  
    const availableTherapists = therapists.filter((therapist: any) => {
      return therapist.availability && Object.keys(therapist.availability).length > 0;
    });
    
    return { results: availableTherapists };
  } catch (error: any) {
    console.error("Error getting therapist dropdown options:", error);
    // Return empty data instead of throwing to prevent app crashes
    return { results: [] };
  }
};

// Get available time slots for a therapist on a specific date
export const getAvailableTimeSlots = async (therapistId: string, date: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/therapist/profiles/${therapistId}/available-slots/`, {
      headers,
      params: { date },
    });
    
    console.log("getAvailableTimeSlots response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error getting available time slots:", error);
    throw error;
  }
};

// Book a new appointment
export const bookAppointment = async (appointmentData: {
  therapist_id: string;
  date: string;
  time: string;
  notes?: string;
  appointment_type?: 'in-person' | 'video' | 'phone';
}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/appointments/`, {
      therapist: appointmentData.therapist_id,
      appointment_date: `${appointmentData.date} ${appointmentData.time}`,
      notes: appointmentData.notes,
      appointment_type: appointmentData.appointment_type || 'video',
    }, {
      headers,
    });
    
    console.log("bookAppointment response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error booking appointment:", error);
    throw error;
  }
};

// --- Therapist APIs ---

export const getAllTherapistProfiles = async () => {
  try {
    const headers = await getAuthHeaders();
    // Use the working endpoint for all therapist profiles
    const response = await axios.get(`${API_URL}/therapist/profiles/all/`, {
      headers,
    });
    
    console.log("getAllTherapistProfiles response:", response.data);
    
    // The backend returns an array directly
    const therapists = Array.isArray(response.data) ? response.data : [];
    
    // Filter therapists with availability
    const availableTherapists = therapists.filter((therapist: any) => {
      return therapist.availability && Object.keys(therapist.availability).length > 0;
    });
    
    return availableTherapists;
  } catch (error: any) {
    console.error("Error fetching therapist profiles:", error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};
