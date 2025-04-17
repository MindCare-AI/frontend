//screens/SettingsScreen/hooks/therapist/useAppointments.ts
import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';

interface Appointment {
  id: number;
  therapist: {
    id: number;
    full_name: string;
  };
  patient: {
    id: number;
    full_name: string;
  };
  appointment_date: string;
  duration: number; // Duration in minutes
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

export const useTherapistAppointments = () => {
  const { accessToken, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      if (!accessToken || !user?.therapist_profile?.id) {
        throw new Error('No access token or therapist profile available');
      }

      const response = await fetch(
        `${API_URL}/therapist/appointments/${user.therapist_profile.id}/`, 
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          },
        }
      );

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
  }, [accessToken, user?.therapist_profile?.id]);

  const refreshAppointments = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const cancelAppointment = async (appointmentId: number) => {
    try {
      if (!accessToken || !user?.therapist_profile?.id) {
        throw new Error('No access token or therapist profile available');
      }

      const response = await fetch(
        `${API_URL}/therapist/appointments/${appointmentId}/cancel/`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to cancel appointment: ${response.statusText}`);
      }

      await fetchAppointments();
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