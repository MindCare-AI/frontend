import { useState, useEffect, useCallback } from 'react';
import { MoodLog, MoodFormData, MoodFilters } from '../../types/Mood';
import { MoodApi } from '../../services/moodApi';
import { useMoodContext } from '../../contexts/moodContext';

export const useMoodLogs = () => {
  const {
    moodLogs,
    isLoading,
    error,
    filters,
    fetchMoodLogs,
    createMoodLog,
    updateMoodLog, 
    deleteMoodLog,
    setFilters
  } = useMoodContext();

  const applyFilters = useCallback((newFilters: Partial<MoodFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchMoodLogs(updatedFilters);
  }, [filters, fetchMoodLogs, setFilters]);

  const clearFilters = useCallback(() => {
    setFilters({});
    fetchMoodLogs({});
  }, [fetchMoodLogs, setFilters]);

  const bulkCreateLogs = async (data: MoodFormData[]): Promise<MoodLog[]> => {
    try {
      const result = await MoodApi.bulkCreateMoodLogs(data);
      fetchMoodLogs(); // Refresh logs after bulk creation
      return result;
    } catch (error) {
      console.error('Error creating bulk logs:', error);
      throw error;
    }
  };

  const exportLogsToCSV = async () => {
    try {
      return await MoodApi.exportMoodLogs(filters);
    } catch (error) {
      console.error('Error exporting logs:', error);
      throw error;
    }
  };

  return {
    moodLogs,
    isLoading,
    error,
    filters,
    fetchMoodLogs,
    createMoodLog,
    updateMoodLog,
    deleteMoodLog,
    applyFilters,
    clearFilters,
    bulkCreateLogs,
    exportLogsToCSV,
  };
};
