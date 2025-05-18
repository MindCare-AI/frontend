// hooks/moodTracker/useMoodLogs.ts
import { useState, useEffect, useCallback } from 'react';
import { MoodLog, MoodFilters, MoodFormData } from '../../types/Mood';
import { MoodApi } from '../../services/moodApi';
import { handleError } from '../../utils/errorHandler';
import { useAuth } from '../../hooks/useAuth';
import { useMood } from '../../contexts/moodContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMoodLogs = (initialFilters?: MoodFilters) => {
  // Get access to global mood context
  const globalMood = useMood();
  const { user } = useAuth(); // Only access user property here
  const [token, setToken] = useState<string | null>(null);
  
  // Local state for component-specific data
  const [filters, setFilters] = useState<MoodFilters>(initialFilters || {});
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filteredLogs, setFilteredLogs] = useState<MoodLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<MoodLog | null>(null);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Get access token when component mounts
  useEffect(() => {
    const getToken = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      setToken(accessToken);
    };
    getToken();
  }, []);

  // Load logs when component mounts or filters change
  useEffect(() => {
    if (token && user) {
      loadLogs();
    }
  }, [token, user, filters]);

  // Fetch logs based on filters
  const loadLogs = useCallback(async () => {
    setLocalLoading(true);
    setLocalError(null);
    
    try {
      if (isFiltering) {
        const data = await MoodApi.getMoodLogs(filters);
        setFilteredLogs(data);
      } else {
        await globalMood.fetchMoodLogs(filters);
        setFilteredLogs([]);
      }
    } catch (err) {
      const formattedError = handleError(err);
      setLocalError(formattedError.message);
    } finally {
      setLocalLoading(false);
    }
  }, [filters, isFiltering, globalMood, token]);

  // Apply new filters
  const applyFilters = useCallback((newFilters: MoodFilters) => {
    setFilters(newFilters);
    setIsFiltering(true);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setIsFiltering(false);
    setFilteredLogs([]);
  }, []);

  // Get a specific log by ID
  const fetchLogById = useCallback(async (id: number) => {
    setLocalLoading(true);
    setLocalError(null);
    
    try {
      const log = await MoodApi.getMoodLog(id);
      setSelectedLog(log);
      return log;
    } catch (err) {
      const formattedError = handleError(err);
      setLocalError(formattedError.message);
      return null;
    } finally {
      setLocalLoading(false);
    }
  }, []);

  // Create a new log
  const createLog = useCallback(async (data: MoodFormData) => {
    return globalMood.createMoodLog(data);
  }, [globalMood]);

  // Update a log
  const updateLog = useCallback(async (id: number, data: Partial<MoodFormData>) => {
    return globalMood.updateMoodLog(id, data);
  }, [globalMood]);

  // Delete a log
  const deleteLog = useCallback(async (id: number) => {
    return globalMood.deleteMoodLog(id);
  }, [globalMood]);

  // Determine which logs to use (filtered or global)
  const currentLogs = isFiltering ? filteredLogs : globalMood.logs;
  
  // Flag for any loading state
  const isLoading = localLoading || globalMood.isLoading;
  
  // Combined error state
  const error = localError || globalMood.error;

  return {
    logs: currentLogs,
    selectedLog,
    isLoading,
    error,
    filters,
    applyFilters,
    resetFilters,
    fetchLogById,
    createLog,
    updateLog,
    deleteLog,
    refresh: loadLogs
  };
};