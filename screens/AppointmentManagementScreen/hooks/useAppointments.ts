import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';

interface Appointment {
  id: number;
  unique_id: string;
  therapist: {
    id: number;
    unique_id: string;
    full_name: string;
  };
  patient: {
    id: number;
    unique_id: string;
    full_name: string;
  };
  appointment_date: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  notes: string | null;
  created_at: string;
  updated_at: string;
  video_session_link: string | null;
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

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/appointments/`, {
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

  const bookAppointment = async (therapistId: string, appointmentDate: string, duration: number, notes?: string) => {
    try {
      const response = await fetch(`${API_URL}/appointments/book/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          therapist_id: therapistId,
          appointment_date: appointmentDate,
          duration_minutes: duration,
          notes: notes || ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      const data = await response.json();
      await fetchAppointments(); // Refresh appointments list
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to book appointment');
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      await fetchAppointments(); // Refresh appointments list
      return true;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to cancel appointment');
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
    cancelAppointment
  };
};