import axios from 'axios';
import { JournalEntry, JournalFilterParams, JournalStatistics, ShareResponse } from '../types/journal';

const API_URL = '/api/journal';

// List all journal entries with optional filtering
export const fetchJournalEntries = async (filters?: JournalFilterParams): Promise<JournalEntry[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.shared !== undefined) params.append('shared', String(filters.shared));
    if (filters?.search) params.append('search', filters.search);
    
    const response = await axios.get(`${API_URL}/entries/`, { params });
    return response.data as JournalEntry[];
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
};

// Get a specific journal entry
export const fetchJournalEntry = async (id: number): Promise<JournalEntry> => {
  try {
    const response = await axios.get(`${API_URL}/entries/${id}/`);
    return response.data as JournalEntry;
  } catch (error) {
    console.error(`Error fetching journal entry ${id}:`, error);
    throw error;
  }
};

// Create a new journal entry
export const createJournalEntry = async (entry: Partial<JournalEntry>): Promise<JournalEntry> => {
  try {
    const response = await axios.post(`${API_URL}/entries/`, entry);
    return response.data as JournalEntry;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

// Update an existing journal entry
export const updateJournalEntry = async (id: number, entry: Partial<JournalEntry>): Promise<JournalEntry> => {
  try {
    const response = await axios.put(`${API_URL}/entries/${id}/`, entry);
    return response.data as JournalEntry;
  } catch (error) {
    console.error(`Error updating journal entry ${id}:`, error);
    throw error;
  }
};

// Partially update an existing journal entry
export const patchJournalEntry = async (id: number, fields: Partial<JournalEntry>): Promise<JournalEntry> => {
  try {
    const response = await axios.patch(`${API_URL}/entries/${id}/`, fields);
    return response.data as JournalEntry;
  } catch (error) {
    console.error(`Error patching journal entry ${id}:`, error);
    throw error;
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/entries/${id}/`);
  } catch (error) {
    console.error(`Error deleting journal entry ${id}:`, error);
    throw error;
  }
};

// Share a journal entry with therapist
export const shareJournalEntry = async (id: number): Promise<ShareResponse> => {
  try {
    const response = await axios.post(`${API_URL}/entries/share/${id}/`);
    return response.data as ShareResponse;
  } catch (error) {
    console.error(`Error sharing journal entry ${id}:`, error);
    throw error;
  }
};

// Get journal statistics
export const fetchJournalStatistics = async (): Promise<JournalStatistics> => {
  try {
    const response = await axios.get(`${API_URL}/entries/statistics/`);
    return response.data as JournalStatistics;
  } catch (error) {
    console.error('Error fetching journal statistics:', error);
    throw error;
  }
};