import axios from "axios";
import { API_URL } from "../../config";
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_APPOINTMENTS, MOCK_THERAPISTS } from '../../data/tunisianMockData';

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
  // MOCK IMPLEMENTATION - Returns mock appointments
  console.log("Mock getAppointments called with params:", params);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Debug: Check upcoming appointments
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const upcomingAppointments = MOCK_APPOINTMENTS.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= now && aptDate <= in30Days && ['pending', 'confirmed'].includes(apt.status);
  });
  
  const azizAppointments = MOCK_APPOINTMENTS.filter(apt => apt.patient.id === 'patient_aziz_1');
  const azizUpcoming = azizAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= now && ['pending', 'confirmed'].includes(apt.status);
  });
  
  console.log(`📊 Debug: Total appointments: ${MOCK_APPOINTMENTS.length}`);
  console.log(`📅 Debug: All upcoming appointments: ${upcomingAppointments.length}`);
  console.log(`👤 Debug: Aziz total appointments: ${azizAppointments.length}`);
  console.log(`🎯 Debug: Aziz upcoming appointments: ${azizUpcoming.length}`);
  
  if (azizUpcoming.length > 0) {
    console.log('✅ Sample Aziz upcoming appointment:', azizUpcoming[0]);
  }
  
  // Return appointments in the expected format
  return {
    results: MOCK_APPOINTMENTS,
    count: MOCK_APPOINTMENTS.length,
    next: null,
    previous: null
  };
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
  // MOCK IMPLEMENTATION - Always succeeds
  console.log("Mock createAppointment called with:", data);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock successful appointment
  return {
    id: Date.now(),
    patient: 1, // Mock patient ID
    therapist: data.therapist,
    appointment_date: data.appointment_date,
    duration: data.duration || "60",
    notes: data.notes || "",
    status: "confirmed",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const cancelAppointment = async (id: number) => {
  // MOCK IMPLEMENTATION - Always succeeds
  console.log("Mock cancelAppointment called with id:", id);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return mock success response
  return {
    id: id,
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
    message: "Appointment cancelled successfully"
  };
};

export const submitAppointmentFeedback = async (
  id: number,
  data: { rating: number; comments: string }
) => {
  // MOCK IMPLEMENTATION - Always succeeds
  console.log("Mock submitAppointmentFeedback called with:", { id, data });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Return mock success response
  return {
    id: Date.now(),
    appointment_id: id,
    rating: data.rating,
    comments: data.comments,
    created_at: new Date().toISOString(),
    message: "Feedback submitted successfully"
  };
};

export const rescheduleAppointment = async (id: number, data: {
  appointment_date: string;
  notes?: string;
}) => {
  // MOCK IMPLEMENTATION - Always succeeds
  console.log("Mock rescheduleAppointment called with:", { id, data });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock success response
  return {
    id: id,
    appointment_date: data.appointment_date,
    notes: data.notes || "",
    status: "rescheduled",
    updated_at: new Date().toISOString(),
    message: "Appointment rescheduled successfully"
  };
};

export async function updateAppointmentDate(appointmentId: number, newDate: string) {
  // MOCK IMPLEMENTATION - Always succeeds
  console.log("Mock updateAppointmentDate called with:", { appointmentId, newDate });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock success response
  return {
    id: appointmentId,
    appointment_date: newDate,
    status: "rescheduled",
    updated_at: new Date().toISOString(),
    message: "Appointment rescheduled successfully"
  };
}

// --- Waiting List APIs ---

export const getWaitingList = async (params: any = {}) => {
  // MOCK IMPLEMENTATION - Returns empty waiting list or mock data
  console.log("Mock getWaitingList called with params:", params);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock waiting list (empty for now, can be populated later)
  return {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
};

export const addToWaitingList = async (data: {
  therapist_id: number;
  preferred_dates: string[];
  preferred_time_slots: string[];
  notes?: string;
}) => {
  // MOCK IMPLEMENTATION - Always succeeds
  console.log("Mock addToWaitingList called with:", data);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock successful response
  return data.preferred_dates.map((date, index) => ({
    data: {
      id: Date.now() + index,
      therapist: data.therapist_id,
      requested_date: date,
      preferred_time_slots: data.preferred_time_slots,
      notes: data.notes || "",
      status: "pending",
      created_at: new Date().toISOString(),
    }
  }));
};

export const removeFromWaitingList = async (id: number) => {
  // MOCK IMPLEMENTATION - Always succeeds
  console.log("Mock removeFromWaitingList called with id:", id);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock success response
  return {
    id: id,
    status: "removed",
    removed_at: new Date().toISOString(),
    message: "Removed from waiting list successfully"
  };
};

// Therapist booking APIs

// Get available therapists for booking with mock data
export const getAvailableTherapistsForBooking = async () => {
  try {
    // Import mock data
    const { getAvailableTherapists } = require('../../data/tunisianMockData');
    
    console.log("DEBUG: Using mock therapists for booking");
    const therapists = getAvailableTherapists();
    
    return {
      results: therapists,
      count: therapists.length
    };
  } catch (error) {
    console.error("DEBUG: Error getting available therapists:", error);
    throw error;
  }
};

// Get therapist dropdown options for booking form
export const getTherapistDropdownOptions = async () => {
  try {
    // Import mock data
    const { getTherapistDropdownOptions } = require('../../data/tunisianMockData');
    
    console.log("DEBUG: Using mock therapist dropdown options");
    const options = getTherapistDropdownOptions();
    
    return {
      results: options,
      count: options.length
    };
  } catch (error) {
    console.error("DEBUG: Error getting therapist dropdown options:", error);
    throw error;
  }
};

// Get available time slots for a therapist on a specific date
export const getAvailableTimeSlots = async (therapistId: string, date: string) => {
  try {
    // Import mock data
    const { getAvailableTimeSlots } = require('../../data/tunisianMockData');
    
    console.log("DEBUG: Getting available time slots for therapist:", therapistId, "on date:", date);
    const timeSlots = getAvailableTimeSlots(therapistId, date);
    
    return {
      available_slots: timeSlots,
      therapist_id: therapistId,
      date: date
    };
  } catch (error) {
    console.error("DEBUG: Error getting available time slots:", error);
    throw error;
  }
};

// Book a new appointment with mock data
export const bookAppointment = async (appointmentData: {
  therapist_id: string;
  date: string;
  time: string;
  notes?: string;
  appointment_type?: 'in-person' | 'video' | 'phone';
}) => {
  try {
    // Import mock data
    const { mockBookAppointment } = require('../../data/tunisianMockData');
    
    console.log("DEBUG: Booking appointment with data:", appointmentData);
    
    // Use mock booking function
    const result = await mockBookAppointment(appointmentData);
    
    console.log("DEBUG: Appointment booked successfully:", result);
    
    return result;
  } catch (error) {
    console.error("DEBUG: Error booking appointment:", error);
    throw error;
  }
};

// --- Therapist APIs ---

export const getAllTherapistProfiles = async () => {
  // MOCK IMPLEMENTATION - Returns mock therapist profiles
  console.log("🔧 [API] Mock getAllTherapistProfiles called");
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  console.log("🔧 [API] Available MOCK_THERAPISTS:", MOCK_THERAPISTS.length);
  
  // Return therapist profiles in the expected format
  const result = MOCK_THERAPISTS.map((therapist: any) => {
    console.log("🔧 [API] Processing therapist:", therapist.full_name);
    return {
      id: therapist.id,
      user: {
        id: therapist.id,
        username: therapist.username,
        first_name: therapist.first_name,
        last_name: therapist.last_name,
        email: therapist.email,
      },
      // Add direct name fields for compatibility with the booking modal
      first_name: therapist.first_name,
      last_name: therapist.last_name,
      name: therapist.full_name, // Use full_name from mock data
      specialization: Array.isArray(therapist.specializations) ? therapist.specializations.join(', ') : 'General Therapy',
      bio: therapist.bio,
      experience_years: therapist.years_of_experience || 5,
      rate_per_hour: therapist.hourly_rate || '100',
      profile_picture: therapist.profile_pic,
      availability: therapist.availability || {
        // Default availability for all therapists
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }],
        saturday: [{ start: '09:00', end: '13:00' }],
        sunday: []
      },
      rating: therapist.rating || 4.5,
      verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
  
  console.log("🔧 [API] Returning therapist profiles:", result.length);
  console.log("🔧 [API] Sample therapist:", result[0]);
  return result;
};
