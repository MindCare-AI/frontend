// services/moodApi.ts
import axios from 'axios';
import { API_URL } from '../config';
import { MoodLog, MoodAnalytics, MoodFormData, MoodFilters } from '../types/Mood';
const MOOD_API_BASE = `${API_URL}/mood/logs`;

// Format optional filters into query string
const formatQueryString = (filters?: MoodFilters): string => {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.minRating) params.append('min_rating', filters.minRating.toString());
  if (filters.maxRating) params.append('max_rating', filters.maxRating.toString());
  if (filters.activities) params.append('activities', filters.activities);
  if (filters.searchText) params.append('search', filters.searchText);
  
  return params.toString() ? `?${params.toString()}` : '';
};

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const MoodApi = {
  // Get all mood logs with optional filters
  getMoodLogs: async (filters?: MoodFilters): Promise<MoodLog[] | PaginatedResponse<MoodLog>> => {
    try {
      const queryString = formatQueryString(filters);
      const response = await axios.get(`${MOOD_API_BASE}/${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mood logs:', error);
      throw error;
    }
  },

  // Get a specific mood log
  getMoodLog: async (id: number): Promise<MoodLog> => {
    try {
      const response = await axios.get(`${MOOD_API_BASE}/${id}/`);
      return response.data as MoodLog;
    } catch (error) {
      console.error(`Error fetching mood log ${id}:`, error);
      throw error;
    }
  },

  // Create a new mood log
  createMoodLog: async (data: MoodFormData): Promise<MoodLog> => {
    try {
      const response = await axios.post(`${MOOD_API_BASE}/`, data);
      return response.data as MoodLog;
    } catch (error) {
      console.error('Error creating mood log:', error);
      throw error;
    }
  },

  // Update an existing mood log
  updateMoodLog: async (id: number, data: Partial<MoodFormData>): Promise<MoodLog> => {
    try {
      const response = await axios.patch(`${MOOD_API_BASE}/${id}/`, data);
      return response.data as MoodLog;
    } catch (error) {
      console.error(`Error updating mood log ${id}:`, error);
      throw error;
    }
  },

  // Delete a mood log
  deleteMoodLog: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${MOOD_API_BASE}/${id}/`);
    } catch (error) {
      console.error(`Error deleting mood log ${id}:`, error);
      throw error;
    }
  },

  // Get mood analytics data
  getMoodAnalytics: async (filters?: MoodFilters): Promise<MoodAnalytics> => {
    try {
      const queryString = formatQueryString(filters);
      const response = await axios.get(`${MOOD_API_BASE}/analytics/${queryString}`);
      return response.data as MoodAnalytics;
    } catch (error) {
      console.error('Error fetching mood analytics:', error);
      throw error;
    }
  },

  // Export mood logs to CSV
  exportMoodLogs: async (filters?: MoodFilters): Promise<Blob> => {
    try {
      const queryString = formatQueryString(filters);
      const response = await axios.get(`${MOOD_API_BASE}/export/${queryString}`, {
        responseType: 'blob'
      });
      return response.data as Blob;
    } catch (error) {
      console.error('Error exporting mood logs:', error);
      throw error;
    }
  },

  // Bulk create multiple mood logs
  bulkCreateMoodLogs: async (data: MoodFormData[]): Promise<MoodLog[]> => {
    try {
      const response = await axios.post(`${MOOD_API_BASE}/bulk_create/`, data);
      return response.data as MoodLog[];
    } catch (error) {
      console.error('Error bulk creating mood logs:', error);
      throw error;
    }
  }
};