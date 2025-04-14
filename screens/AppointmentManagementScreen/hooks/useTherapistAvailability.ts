import { useState, useCallback } from 'react';
import { API_URL } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';

interface Therapist {
  id: number;
  unique_id: string;
  full_name: string;
  specialization: string;
  profile_pic: string | null;
  rating: number;
  available_days: Record<string, Array<{ start: string; end: string }>>;
}

interface TimeSlot {
  start: string;
  end: string;
}

export const useTherapistAvailability = () => {
  const { accessToken } = useAuth();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error('Failed to fetch available therapists');
      }

      const data = await response.json();
      setTherapists(data.results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch therapists');
      console.error('Error fetching therapists:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchAvailableSlots = useCallback(async (therapistId: string, date: Date) => {
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
      setAvailableSlots(data.available_slots);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch time slots');
      console.error('Error fetching time slots:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  return {
    therapists,
    availableSlots,
    loading,
    error,
    fetchTherapists,
    fetchAvailableSlots
  };
};