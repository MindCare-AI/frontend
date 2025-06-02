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
  console.log("getAppointments params:", params);
  const url = `${API_URL}/appointments/`;
  console.log("getAppointments URL:", url);
  
  // Make a simple request without any filters
  const resp = await axios.get(url, {
    headers: await getAuthHeaders()
  });
  console.log("Appointments response:", resp.data);
  
  return resp.data;
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
  // Get current user profile function
  const getCurrentUserProfile = async (): Promise<UserProfile> => {
    try {
      const resp = await axios.get<UserProfile>(`${API_URL}/users/me/`, {
        headers: await getAuthHeaders(),
      });
      console.log('getCurrentUserProfile response:', resp.data);
      return resp.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Unable to fetch user profile');
    }
  };

  try {
    // Get current user's profile
    const userProfile = await getCurrentUserProfile();

    // Check if user has a valid profile_id
    if (typeof userProfile.profile_id !== "number") {
      throw new Error('User must have a valid profile_id to create appointments');
    }

    const appointmentData = {
      patient: userProfile.profile_id, // Use profile_id from user profile
      therapist: data.therapist,
      appointment_date: data.appointment_date,
      duration: data.duration || "60", // Default 60 minutes if not provided
      notes: data.notes || "",
    };

    const resp = await axios.post(`${API_URL}/appointments/`, appointmentData, {
      headers: await getAuthHeaders(),
    });
    return resp.data;
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Appointment creation error:', apiError.response?.data || apiError.message);
    throw error;
  }
};

export const cancelAppointment = async (id: number) => {
  const resp = await axios.post(
    `${API_URL}/appointments/${id}/cancel/`,
    {},
    { headers: await getAuthHeaders() }
  );
  return resp.data;
};

export const submitAppointmentFeedback = async (
  id: number,
  data: { rating: number; comments: string }
) => {
  const resp = await axios.post(
    `${API_URL}/appointments/${id}/feedback/`,
    data,
    { headers: await getAuthHeaders() }
  );
  return resp.data;
};

export const rescheduleAppointment = async (id: number, data: {
  appointment_date: string;
  notes?: string;
}) => {
  const resp = await axios.put(
    `${API_URL}/appointments/${id}/`,
    data,
    { headers: await getAuthHeaders() }
  );
  return resp.data;
};

export async function updateAppointmentDate(appointmentId: number, newDate: string) {
  // Adjust endpoint and payload as per your backend
  return fetch(`${API_URL}/appointments/${appointmentId}/`, {
    method: "PUT",
    headers: {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ new_date: newDate }),
  }).then(res => {
    if (!res.ok) throw new Error("Failed to reschedule")
    return res.json()
  })
}

// --- Waiting List APIs ---

export const getWaitingList = async (params: any = {}) => {
  const resp = await axios.get(`${API_URL}/appointments/waiting-list/`, {
    params,
    headers: await getAuthHeaders(),
  });
  return resp.data;
};

export const addToWaitingList = async (data: {
  therapist_id: number;
  preferred_dates: string[];
  preferred_time_slots: string[];
  notes?: string;
}) => {
  // Backend expects therapist, requested_date, preferred_time_slots, notes
  // We'll send one entry per preferred_date
  const promises = data.preferred_dates.map(async (date) =>
    axios.post(
      `${API_URL}/appointments/waiting-list/`,
      {
        therapist: data.therapist_id,
        requested_date: date,
        preferred_time_slots: data.preferred_time_slots,
        notes: data.notes,
      },
      { headers: await getAuthHeaders() }
    )
  );
  return Promise.all(promises);
};

export const removeFromWaitingList = async (id: number) => {
  const resp = await axios.post(
    `${API_URL}/appointments/waiting-list/${id}/cancel/`,
    {},
    { headers: await getAuthHeaders() }
  );
  return resp.data;
};

export const getAllTherapistProfiles = async () => {
  const resp = await axios.get(`${API_URL}/therapist/profiles/all`, {
    headers: await getAuthHeaders(),
  });
  return resp.data;
};
