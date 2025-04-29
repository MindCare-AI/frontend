import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  fetchJournalEntries,
  fetchJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  shareJournalEntry,
  fetchJournalStatistics
} from '../API/journal';
import { JournalEntry, JournalFilterParams, JournalStatistics, ShareResponse } from '../types/journal';

interface JournalContextType {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  statistics: JournalStatistics | null;
  loading: boolean;
  error: string | null;
  filterParams: JournalFilterParams;
  
  // Actions
  fetchEntries: (filters?: JournalFilterParams) => Promise<void>;
  fetchEntry: (id: number) => Promise<JournalEntry>;
  addEntry: (entry: Partial<JournalEntry>) => Promise<JournalEntry>;
  editEntry: (id: number, entry: Partial<JournalEntry>) => Promise<JournalEntry>;
  removeEntry: (id: number) => Promise<void>;
  shareEntry: (id: number) => Promise<ShareResponse>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: JournalFilterParams) => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};

interface JournalProviderProps {
  children: ReactNode;
}

export const JournalProvider: React.FC<JournalProviderProps> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [statistics, setStatistics] = useState<JournalStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState<JournalFilterParams>({});

  // Fetch all journal entries with optional filters
  const fetchEntries = useCallback(async (filters?: JournalFilterParams) => {
    try {
      setLoading(true);
      setError(null);
      const newFilters = filters || filterParams;
      setFilterParams(newFilters);
      
      const data = await fetchJournalEntries(newFilters);
      setEntries(data);
    } catch (err) {
      setError('Failed to fetch journal entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterParams]);

  // Fetch a specific journal entry by ID
  const fetchEntry = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchJournalEntry(id);
      setCurrentEntry(data);
      return data;
    } catch (err) {
      setError(`Failed to fetch journal entry ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new journal entry
  const addEntry = useCallback(async (entry: Partial<JournalEntry>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newEntry = await createJournalEntry(entry);
      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      setError('Failed to create journal entry');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing journal entry
  const editEntry = useCallback(async (id: number, entry: Partial<JournalEntry>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedEntry = await updateJournalEntry(id, entry);
      setEntries(prev => prev.map(e => e.id === id ? updatedEntry : e));
      
      if (currentEntry && currentEntry.id === id) {
        setCurrentEntry(updatedEntry);
      }
      
      return updatedEntry;
    } catch (err) {
      setError(`Failed to update journal entry ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentEntry]);

  // Delete a journal entry
  const removeEntry = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteJournalEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      
      if (currentEntry && currentEntry.id === id) {
        setCurrentEntry(null);
      }
    } catch (err) {
      setError(`Failed to delete journal entry ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentEntry]);

  // Share a journal entry with therapist
  const shareEntry = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await shareJournalEntry(id);
      
      // Update the entry in our state to reflect it's now shared
      setEntries(prev => prev.map(e => 
        e.id === id ? { ...e, shared_with_therapist: true } : e
      ));
      
      if (currentEntry && currentEntry.id === id) {
        setCurrentEntry({ ...currentEntry, shared_with_therapist: true });
      }
      
      return response;
    } catch (err) {
      setError(`Failed to share journal entry ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentEntry]);

  // Fetch journal statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchJournalStatistics();
      setStatistics(data);
    } catch (err) {
      setError('Failed to fetch journal statistics');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Set filter parameters
  const setFilters = useCallback((filters: JournalFilterParams) => {
    setFilterParams(filters);
  }, []);

  // Fetch entries on mount and when filters change
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const value = {
    entries,
    currentEntry,
    statistics,
    loading,
    error,
    filterParams,
    fetchEntries,
    fetchEntry,
    addEntry,
    editEntry,
    removeEntry,
    shareEntry,
    fetchStats,
    setFilters
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};

export default JournalProvider;