import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MoodLog, MoodFormData, MoodFilters, MoodAnalytics } from '../types/Mood';
import { MoodApi } from '../services/moodApi';

interface MoodContextType {
  moodLogs: MoodLog[];
  isLoading: boolean;
  error: string | null;
  analytics: MoodAnalytics | null;
  filters: MoodFilters;
  fetchMoodLogs: (filters?: MoodFilters) => Promise<void>;
  fetchAnalytics: (filters?: MoodFilters) => Promise<void>;
  createMoodLog: (data: MoodFormData) => Promise<MoodLog>;
  updateMoodLog: (id: number, data: Partial<MoodFormData>) => Promise<MoodLog>;
  deleteMoodLog: (id: number) => Promise<void>;
  setFilters: (filters: MoodFilters) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider = ({ children }: { children: ReactNode }) => {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MoodFilters>({});

  const fetchMoodLogs = async (queryFilters?: MoodFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = queryFilters || filters;
      const logs = await MoodApi.getMoodLogs(appliedFilters);
      // Ensure logs is an array before setting state
      setMoodLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      setError('Failed to fetch mood logs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async (queryFilters?: MoodFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = queryFilters || filters;
      const analyticsData = await MoodApi.getMoodAnalytics(appliedFilters);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createMoodLog = async (data: MoodFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newLog = await MoodApi.createMoodLog(data);
      // Fix the error by explicitly handling potential null/undefined cases
      setMoodLogs(prevLogs => Array.isArray(prevLogs) ? [newLog, ...prevLogs] : [newLog]);
      return newLog;
    } catch (err) {
      setError('Failed to create mood log');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMoodLog = async (id: number, data: Partial<MoodFormData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedLog = await MoodApi.updateMoodLog(id, data);
      // Fix the error by ensuring prevLogs is treated as an array
      setMoodLogs(prevLogs => {
        if (!Array.isArray(prevLogs)) return [updatedLog];
        return prevLogs.map(log => log.id === id ? updatedLog : log);
      });
      return updatedLog;
    } catch (err) {
      setError('Failed to update mood log');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMoodLog = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await MoodApi.deleteMoodLog(id);
      // Fix the error by ensuring prevLogs is treated as an array
      setMoodLogs(prevLogs => {
        if (!Array.isArray(prevLogs)) return [];
        return prevLogs.filter(log => log.id !== id);
      });
    } catch (err) {
      setError('Failed to delete mood log');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchMoodLogs();
    fetchAnalytics();
  }, []);

  const value = {
    moodLogs,
    isLoading,
    error,
    analytics,
    filters,
    fetchMoodLogs,
    fetchAnalytics,
    createMoodLog,
    updateMoodLog,
    deleteMoodLog,
    setFilters,
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

export const useMoodContext = () => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMoodContext must be used within a MoodProvider');
  }
  return context;
};
