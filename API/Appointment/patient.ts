import axios from "axios";
import { API_URL } from "../../config";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  console.log("Auth token used:", token);
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// --- Appointment APIs ---

export const getAppointments = async (params: any = {}) => {
  console.log("getAppointments params:", params);
  const url = `${API_URL}/appointments`;
  console.log("getAppointments URL:", url);
  
  // Make a simple request without any filters
  const resp = await axios.get(url, {
    headers: getAuthHeaders()
  });
  console.log("Appointments response:", resp.data);
  
  return resp.data;
};

export const createAppointment = async (data: {
  therapist: number;
  appointment_date: string;
  notes?: string;
}) => {
  const resp = await axios.post(`${API_URL}/appointments`, data, {
    headers: getAuthHeaders(),
  });
  return resp.data;
};

export const cancelAppointment = async (id: number) => {
  const resp = await axios.post(
    `${API_URL}/appointments/${id}/cancel/`,
    {},
    { headers: getAuthHeaders() }
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
    { headers: getAuthHeaders() }
  );
  return resp.data;
};

export const rescheduleAppointment = async (id: number, data: {
  appointment_date: string;
  notes?: string;
}) => {
  const resp = await axios.patch(
    `${API_URL}/appointments/${id}/`,
    data,
    { headers: getAuthHeaders() }
  );
  return resp.data;
};

export async function updateAppointmentDate(appointmentId: number, newDate: string) {
  // Adjust endpoint and payload as per your backend
  return fetch(`/api/appointments/${appointmentId}/reschedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: getAuthHeaders(),
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
  const promises = data.preferred_dates.map((date) =>
    axios.post(
      `${API_URL}/appointments/waiting-list/`,
      {
        therapist: data.therapist_id,
        requested_date: date,
        preferred_time_slots: data.preferred_time_slots,
        notes: data.notes,
      },
      { headers: getAuthHeaders() }
    )
  );
  return Promise.all(promises);
};

export const removeFromWaitingList = async (id: number) => {
  const resp = await axios.post(
    `${API_URL}/appointments/waiting-list/${id}/cancel/`,
    {},
    { headers: getAuthHeaders() }
  );
  return resp.data;
};

export const getAllTherapistProfiles = async () => {
  const resp = await axios.get(`${API_URL}/therapist/profiles/all`, {
    headers: getAuthHeaders(),
  });
  return resp.data;
};
