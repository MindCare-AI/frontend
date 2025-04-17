import { useState, useCallback } from 'react';
import { API_URL } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';
import type { TherapistProfile } from '../../../types/profile'; // <-- Import the shared type

interface TimeSlot {
  start: string;
  end: string;
}

export const useTherapistAvailability = () => {
  const { accessToken } = useAuth();
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]); // <-- Use TherapistProfile[]
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all therapist profiles (public)
  const fetchTherapists = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/therapist/profiles/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch therapists');
      }

      const data = await response.json();
      setTherapists(data.results || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch therapists');
      console.error('Error fetching therapists:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Fetch available slots for a therapist on a given date
  const fetchAvailableSlots = useCallback(
    async (therapistId: number, date: Date) => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const formattedDate = date.toISOString().split('T')[0];
        const response = await fetch(
          `${API_URL}/therapist/profiles/${therapistId}/availability/?date=${formattedDate}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch available time slots');
        }

        const data = await response.json();
        setAvailableSlots(data.available_slots || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch time slots');
        console.error('Error fetching time slots:', err);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // Set therapist availability (for therapist user)
  const setAvailability = useCallback(
    async (therapistId: number, available_days: string[], time_slots: string[]) => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/therapist/profiles/${therapistId}/availability/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              available_days,
              time_slots
            })
          }
        );

        if (!response.ok) {
          throw new Error('Failed to set availability');
        }

        setError(null);
        // Optionally, refetch slots or therapists
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to set availability');
        console.error('Error setting availability:', err);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  return {
    therapists,
    availableSlots,
    loading,
    error,
    fetchTherapists,
    fetchAvailableSlots,
    setAvailability,
  };
};