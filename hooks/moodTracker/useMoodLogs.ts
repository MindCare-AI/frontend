import { useState, useEffect, useCallback } from 'react';
import { MoodLog, MoodFormData, MoodFilters } from '../../types/Mood';
import { MoodApi } from '../../services/moodApi';
import { useMoodContext } from '../../contexts/moodContext';
import { useIsFocused } from '@react-navigation/native';

export const useMoodLogs = () => {
  const {
    moodLogs,
    isLoading,
    error,
    filters,
    fetchMoodLogs: contextFetchMoodLogs,
    createMoodLog,
    updateMoodLog, 
    deleteMoodLog,
    setFilters
  } = useMoodContext();
  
  // Add this to fetch logs when the screen is focused
  const isFocused = useIsFocused();
  
  // Wrapper for context fetch that handles the API response format
  const fetchMoodLogs = useCallback(async (queryFilters?: MoodFilters) => {
    // Force refetch from API to ensure we have fresh data
    return await contextFetchMoodLogs(queryFilters);
  }, [contextFetchMoodLogs]);
  
  useEffect(() => {
    if (isFocused) {
      fetchMoodLogs();
    }
  }, [isFocused, fetchMoodLogs]);

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
