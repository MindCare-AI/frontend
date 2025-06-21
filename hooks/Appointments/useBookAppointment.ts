import { useState, useCallback } from 'react';
import * as AppointmentAPI from '../../API/Appointment/patient';

interface BookAppointmentData {
  therapist_id: string;
  date: string;
  time: string;
  notes?: string;
  appointment_type?: 'in-person' | 'video' | 'phone';
}

interface BookAppointmentResult {
  success: boolean;
  appointment?: any;
  message?: string;
}

interface TherapistDropdownResponse {
  results: any[];
}

interface TimeSlotsResponse {
  available_slots: string[];
}

export const useBookAppointment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTherapists, setAvailableTherapists] = useState<any[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Get available therapists for booking
  const fetchAvailableTherapists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AppointmentAPI.getTherapistDropdownOptions() as TherapistDropdownResponse;
      setAvailableTherapists(response.results || []);
      
      return response.results || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch therapists';
      setError(errorMessage);
      console.error('Error fetching available therapists:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get available time slots for a specific therapist and date
  const fetchAvailableTimeSlots = useCallback(async (therapistId: string, date: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AppointmentAPI.getAvailableTimeSlots(therapistId, date) as TimeSlotsResponse;
      setAvailableTimeSlots(response.available_slots || []);
      
      return response.available_slots || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch time slots';
      setError(errorMessage);
      console.error('Error fetching available time slots:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Book an appointment
  const bookAppointment = useCallback(async (appointmentData: BookAppointmentData): Promise<BookAppointmentResult> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Booking appointment with data:', appointmentData);
      
      const result = await AppointmentAPI.bookAppointment(appointmentData) as BookAppointmentResult;
      
      console.log('Appointment booking result:', result);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to book appointment';
      setError(errorMessage);
      console.error('Error booking appointment:', err);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setError(null);
    setAvailableTherapists([]);
    setAvailableTimeSlots([]);
  }, []);

  return {
    loading,
    error,
    availableTherapists,
    availableTimeSlots,
    fetchAvailableTherapists,
    fetchAvailableTimeSlots,
    bookAppointment,
    reset
  };
};

export default useBookAppointment;
