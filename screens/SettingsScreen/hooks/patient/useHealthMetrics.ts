//screens/SettingsScreen/hooks/patient/useHealthMetrics.ts
import { useState, useEffect } from 'react';
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';

export interface HealthMetric {
  id: number;
  metric_type: string;
  value: string;
  timestamp: string;
  patient: number;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: HealthMetric[];
}

export const useHealthMetrics = () => {
  const { accessToken } = useAuth();
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthMetrics = async () => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_URL}/patient/health-metrics/`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data: PaginatedResponse = await response.json();
      setHealthMetrics(data.results);
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(message);
      console.error('Error fetching health metrics:', message);
    } finally {
      setLoading(false);
    }
  };

  const createHealthMetric = async (newMetric: Omit<HealthMetric, 'id' | 'timestamp' | 'patient'>) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_URL}/patient/health-metrics/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(newMetric)
      });

      if (!response.ok) {
        throw new Error(`Failed to create metric: ${response.statusText}`);
      }

      const data: HealthMetric = await response.json();
      setHealthMetrics(prev => [...prev, data]);
      setError(null);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create health metric';
      setError(message);
      throw error;
    }
  };

  const fetchHealthMetricById = async (id: number) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_URL}/patient/health-metrics/${id}/`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metric: ${response.statusText}`);
      }

      const data: HealthMetric = await response.json();
      setError(null);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch health metric';
      setError(message);
      throw error;
    }
  };

  const updateHealthMetric = async (id: number, updatedMetric: Partial<Omit<HealthMetric, 'id' | 'patient'>>) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_URL}/patient/health-metrics/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedMetric)
      });

      if (!response.ok) {
        throw new Error(`Failed to update metric: ${response.statusText}`);
      }

      const data: HealthMetric = await response.json();
      setHealthMetrics(prev =>
        prev.map(metric => (metric.id === id ? data : metric))
      );
      setError(null);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update health metric';
      setError(message);
      throw error;
    }
  };

  const deleteHealthMetric = async (id: number) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_URL}/patient/health-metrics/${id}/`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete metric: ${response.statusText}`);
      }

      setHealthMetrics(prev => prev.filter(metric => metric.id !== id));
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete health metric';
      setError(message);
      throw error;
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchHealthMetrics();
    }
  }, [accessToken]);

  return {
    healthMetrics,
    loading,
    error,
    fetchHealthMetrics,
    createHealthMetric,
    fetchHealthMetricById,
    updateHealthMetric,
    deleteHealthMetric,
  };
};