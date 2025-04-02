//screens/SettingsScreen/hooks/therapist/useAppointments.ts
import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';

interface Appointment {
  id: number;
  therapist: number;
  therapist_name: string;
  patient: number;
  patient_name: string;
  appointment_date: string;
  duration: string;
  status: 'scheduled' | string;
  notes: string;
  created_at: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Appointment[];
}

export const useTherapistAppointments = () => {
  const { accessToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_URL}/therapist/appointments/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
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

  const refreshAppointments = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const cancelAppointment = async (appointmentId: number) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(
        `${API_URL}/therapist/appointments/${appointmentId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      refreshAppointments();
      return true;
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment');
      return false;
    }
  };

  return {
    appointments,
    loading,
    error,
    refreshing,
    refreshAppointments,
    cancelAppointment,
  };
};