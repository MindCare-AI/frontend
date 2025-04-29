// hooks/moodTracker/useMoodAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import { MoodAnalytics, MoodFilters } from '../../types/Mood';
import { MoodApi } from '../../services/moodApi';
import { handleError } from '../../utils/errorHandler';
import { useAuth } from '../../hooks/useAuth';
import { useMood } from '../../contexts/moodContext';
import { getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth } from '../../utils/dateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMoodAnalytics = (initialFilters?: MoodFilters) => {
  const globalMood = useMood();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<MoodFilters>(initialFilters || {});
  const [localAnalytics, setLocalAnalytics] = useState<MoodAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'custom'>('week');
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Function to set timeframe filters
  const updateTimeframe = useCallback((newTimeframe: 'week' | 'month' | 'custom', customDates?: { startDate: string; endDate: string }) => {
    setTimeframe(newTimeframe);
    
    let newFilters: MoodFilters = {};
    
    if (newTimeframe === 'week') {
      newFilters = {
        ...filters,
        startDate: getStartOfWeek(),
        endDate: getEndOfWeek()
      };
    } else if (newTimeframe === 'month') {
      newFilters = {
        ...filters,
        startDate: getStartOfMonth(),
        endDate: getEndOfMonth()
      };
    } else if (newTimeframe === 'custom' && customDates) {
      newFilters = {
        ...filters,
        startDate: customDates.startDate,
        endDate: customDates.endDate
      };
    }
    
    setFilters(newFilters);
  }, [filters]);

  // Load analytics when component mounts or filters change
  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
    
    // Initialize with default weekly timeframe if no filters provided
    if (!initialFilters && timeframe === 'week' && !filters.startDate) {
      updateTimeframe('week');
    }
  }, [user, filters]);

  // Fetch analytics based on filters
  const loadAnalytics = useCallback(async () => {
    setLocalLoading(true);
    setLocalError(null);
    
    try {
      if (Object.keys(filters).length > 0) {
        const data = await MoodApi.getMoodAnalytics(filters);
        setLocalAnalytics(data);
      } else {
        await globalMood.fetchMoodAnalytics();
        setLocalAnalytics(null);
      }
    } catch (err) {
      const formattedError = handleError(err);
      setLocalError(formattedError.message);
    } finally {
      setLocalLoading(false);
    }
  }, [filters, globalMood]);

  // Function to update filters (for specific ratings, activities, etc.)
  const updateFilters = useCallback((newFilters: Partial<MoodFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setTimeframe('week');
    setLocalAnalytics(null);
  }, []);

  // Function to export analytics data
  const exportAnalytics = useCallback(async () => {
    try {
      await globalMood.exportMoodData(filters);
      return true;
    } catch (err) {
      handleError(err, ({ message }) => {
        setLocalError(message);
      });
      return false;
    }
  }, [filters, globalMood]);

  // Determine which analytics to use (local or global)
  const currentAnalytics = localAnalytics || globalMood.analytics;
  
  // Flag for any loading state
  const isLoading = localLoading || globalMood.isLoading;
  
  // Combined error state
  const error = localError || globalMood.error;

  return {
    analytics: currentAnalytics,
    isLoading,
    error,
    filters,
    timeframe,
    updateTimeframe,
    updateFilters,
    resetFilters,
    exportAnalytics,
    refresh: loadAnalytics
  };
};