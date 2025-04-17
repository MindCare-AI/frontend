import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';

interface Appointment {
  id: number;
  patient: {
    id: number;
    full_name: string;
  };
  therapist: {
    id: number;
    full_name: string;
  };
  appointment_date: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending' | string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  video_session_link?: string | null;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Appointment[];
}

export const useAppointments = () => {
  const { accessToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all appointments (for both therapist and patient)
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/therapist/appointments/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.statusText}`);
      }

      const data: PaginatedResponse = await response.json();
      setAppointments(data.results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  // Book appointment (for patient, using therapist profile endpoint)
  const bookAppointment = async (
    therapistId: number,
    appointmentDate: string,
    duration: number,
    notes?: string
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/therapist/profiles/${therapistId}/book-appointment/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            appointment_date: appointmentDate,
            duration_minutes: duration,
            notes: notes || ''
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      const data = await response.json();
      await fetchAppointments();
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to book appointment');
    }
  };

  // Cancel appointment (PATCH status to cancelled)
  const cancelAppointment = async (appointmentId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/therapist/appointments/${appointmentId}/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'cancelled' })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      await fetchAppointments();
      return true;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to cancel appointment');
    }
  };

  // Update appointment (status or notes)
  const updateAppointment = async (
    appointmentId: number,
    updates: Partial<{ status: string; notes: string }>
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/therapist/appointments/${appointmentId}/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      const data = await response.json();
      await fetchAppointments();
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update appointment');
    }
  };

  // Delete appointment
  const deleteAppointment = async (appointmentId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/therapist/appointments/${appointmentId}/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      await fetchAppointments();
      return true;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete appointment');
    }
  };

  const refreshAppointments = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refreshing,
    refreshAppointments,
    bookAppointment,
    cancelAppointment,
    updateAppointment,
    deleteAppointment,
  };
};