// contexts/moodContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MoodLog, MoodAnalytics, MoodFilters, MoodFormData } from '../types/Mood';
import { MoodApi } from '../services/moodApi';
import { handleError } from '../utils/errorHandler';
import { useAuth } from './AuthContext';

interface MoodContextType {
  logs: MoodLog[];
  analytics: MoodAnalytics | null;
  isLoading: boolean;
  error: string | null;
  fetchMoodLogs: (filters?: MoodFilters) => Promise<void>;
  fetchMoodAnalytics: (filters?: MoodFilters) => Promise<void>;
  createMoodLog: (data: MoodFormData) => Promise<MoodLog | null>;
  updateMoodLog: (id: number, data: Partial<MoodFormData>) => Promise<MoodLog | null>;
  deleteMoodLog: (id: number) => Promise<boolean>;
  exportMoodData: (filters?: MoodFilters) => Promise<void>;
}

const initialAnalytics: MoodAnalytics = {
  weekly_average: 0,
  monthly_average: 0,
  daily_trends: [],
  entry_count: 0
};

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { accessToken, user } = useAuth();
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when user changes
  useEffect(() => {
    setLogs([]);
    setAnalytics(null);
    setError(null);
  }, [user?.id]);

  const fetchMoodLogs = async (filters?: MoodFilters) => {
    if (!accessToken) {
      setError('You must be logged in to view mood logs');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await MoodApi.getMoodLogs(filters);
      setLogs(data);
    } catch (err) {
      const formattedError = handleError(err);
      setError(formattedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoodAnalytics = async (filters?: MoodFilters) => {
    if (!accessToken) {
      setError('You must be logged in to view analytics');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await MoodApi.getMoodAnalytics(filters);
      setAnalytics(data);
    } catch (err) {
      const formattedError = handleError(err);
      setError(formattedError.message);
      setAnalytics(initialAnalytics);
    } finally {
      setIsLoading(false);
    }
  };

  const createMoodLog = async (data: MoodFormData): Promise<MoodLog | null> => {
    if (!accessToken) {
      setError('You must be logged in to create a mood log');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newLog = await MoodApi.createMoodLog(data);
      setLogs(prev => [newLog, ...prev]);
      return newLog;
    } catch (err) {
      const formattedError = handleError(err);
      setError(formattedError.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMoodLog = async (
    id: number,
    data: Partial<MoodFormData>
  ): Promise<MoodLog | null> => {
    if (!accessToken) {
      setError('You must be logged in to update a mood log');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedLog = await MoodApi.updateMoodLog(id, data);
      setLogs(prev => prev.map(log => (log.id === id ? updatedLog : log)));
      return updatedLog;
    } catch (err) {
      const formattedError = handleError(err);
      setError(formattedError.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMoodLog = async (id: number): Promise<boolean> => {
    if (!accessToken) {
      setError('You must be logged in to delete a mood log');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await MoodApi.deleteMoodLog(id);
      setLogs(prev => prev.filter(log => log.id !== id));
      return true;
    } catch (err) {
      const formattedError = handleError(err);
      setError(formattedError.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const exportMoodData = async (filters?: MoodFilters): Promise<void> => {
    if (!accessToken) {
      setError('You must be logged in to export data');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const blob = await MoodApi.exportMoodLogs(filters);
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `mood-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const formattedError = handleError(err);
      setError(formattedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value: MoodContextType = {
    logs,
    analytics,
    isLoading,
    error,
    fetchMoodLogs,
    fetchMoodAnalytics,
    createMoodLog,
    updateMoodLog,
    deleteMoodLog,
    exportMoodData,
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

export const useMood = (): MoodContextType => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};