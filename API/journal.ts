import axios from 'axios';
import type { Journal, JournalEntry } from '../types/Journal/index';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNAL_URL = `${API_URL}/journal`;

// Create a custom axios instance for journal API
const journalAPI = axios.create({
  baseURL: API_URL,
});

// Helper function to get auth headers
const getAuthHeaders = async () => {
  try {
    // Use 'accessToken' to match the storage key used throughout the app
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return {
    'Content-Type': 'application/json',
  };
};

// Journal Category (Journal) endpoints
export const fetchJournalCategories = async (): Promise<Journal[]> => {
  try {
    console.log('Fetching from:', `${JOURNAL_URL}/categories/`);
    const headers = await getAuthHeaders();
    const response = await journalAPI.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Journal[];
    }>(`${JOURNAL_URL}/categories/`, { headers });
    
    console.log('API Response:', response.data);
    
    // Extract the results array from the paginated response
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createJournalCategory = async (category: Omit<Journal, "id" | "created_at" | "updated_at" | "user">): Promise<Journal> => {
  const headers = await getAuthHeaders();
  const response = await journalAPI.post<Journal>(`${JOURNAL_URL}/categories/`, category, { headers });
  return response.data;
};

export const updateJournalCategory = async (id: number, category: Partial<Journal>): Promise<Journal> => {
  const headers = await getAuthHeaders();
  const response = await journalAPI.patch<Journal>(`${JOURNAL_URL}/categories/${id}/`, category, { headers });
  return response.data;
};

export const deleteJournalCategory = async (id: number): Promise<void> => {
  const headers = await getAuthHeaders();
  await journalAPI.delete(`${JOURNAL_URL}/categories/${id}/`, { headers });
};

// Journal Entry endpoints
export const fetchJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    console.log('Fetching from:', `${JOURNAL_URL}/entries/`);
    const headers = await getAuthHeaders();
    const response = await journalAPI.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: JournalEntry[];
    }>(`${JOURNAL_URL}/entries/`, { headers });
    
    console.log('Entries API Response:', response.data);
    
    // Extract the results array from the paginated response
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching entries:', error);
    throw error;
  }
};

export const fetchJournalEntry = async (id: number): Promise<JournalEntry> => {
  const headers = await getAuthHeaders();
  const response = await journalAPI.get<JournalEntry>(`${JOURNAL_URL}/entries/${id}/`, { headers });
  return response.data;
};

export const createJournalEntry = async (entry: Omit<JournalEntry, "id" | "date" | "created_at" | "updated_at" | "user" | "word_count">): Promise<JournalEntry> => {
  const headers = await getAuthHeaders();
  const response = await journalAPI.post<JournalEntry>(`${JOURNAL_URL}/entries/`, entry, { headers });
  return response.data;
};

export const updateJournalEntry = async (id: number, entry: Partial<JournalEntry>): Promise<JournalEntry> => {
  const headers = await getAuthHeaders();
  const response = await journalAPI.patch<JournalEntry>(`${JOURNAL_URL}/entries/${id}/`, entry, { headers });
  return response.data;
};

export const deleteJournalEntry = async (id: number): Promise<void> => {
  const headers = await getAuthHeaders();
  await journalAPI.delete(`${JOURNAL_URL}/entries/${id}/`, { headers });
};

// Share entry with therapist
export const shareJournalEntry = async (id: number) => {
  const headers = await getAuthHeaders();
  const response = await journalAPI.post(`${API_URL}/entries/${id}/share/`, {}, { headers });
  return response.data;
};

// Get journal statistics
export const fetchJournalStatistics = async () => {
  const headers = await getAuthHeaders();
  const response = await journalAPI.get(`${API_URL}/entries/statistics/`, { headers });
  return response.data;
};