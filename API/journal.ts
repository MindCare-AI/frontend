import axios from 'axios';
import type { Journal, JournalEntry } from '../types/Journal/index';

import { API_URL } from '../config';
const JOURNAL_URL = `${API_URL}/journal`;

// Journal Category (Journal) endpoints
export const fetchJournalCategories = async (): Promise<Journal[]> => {
  const response = await axios.get<Journal[]>(`${JOURNAL_URL}/categories/`);
  return response.data;
};

export const createJournalCategory = async (category: Omit<Journal, "id" | "created_at" | "updated_at" | "user">): Promise<Journal> => {
  const response = await axios.post<Journal>(`${JOURNAL_URL}/categories/`, category);
  return response.data;
};

export const updateJournalCategory = async (id: number, category: Partial<Journal>): Promise<Journal> => {
  const response = await axios.patch<Journal>(`${JOURNAL_URL}/categories/${id}/`, category);
  return response.data;
};

export const deleteJournalCategory = async (id: number): Promise<void> => {
  await axios.delete(`${JOURNAL_URL}/categories/${id}/`);
};

// Journal Entry endpoints
export const fetchJournalEntries = async (): Promise<JournalEntry[]> => {
  const response = await axios.get<JournalEntry[]>(`${JOURNAL_URL}/entries/`);
  return response.data;
};

export const fetchJournalEntry = async (id: number): Promise<JournalEntry> => {
  const response = await axios.get<JournalEntry>(`${JOURNAL_URL}/entries/${id}/`);
  return response.data;
};

export const createJournalEntry = async (entry: Omit<JournalEntry, "id" | "date" | "created_at" | "updated_at" | "user" | "word_count">): Promise<JournalEntry> => {
  const response = await axios.post<JournalEntry>(`${JOURNAL_URL}/entries/`, entry);
  return response.data;
};

export const updateJournalEntry = async (id: number, entry: Partial<JournalEntry>): Promise<JournalEntry> => {
  const response = await axios.patch<JournalEntry>(`${JOURNAL_URL}/entries/${id}/`, entry);
  return response.data;
};

export const deleteJournalEntry = async (id: number): Promise<void> => {
  await axios.delete(`${JOURNAL_URL}/entries/${id}/`);
};

// Share entry with therapist
export const shareJournalEntry = async (id: number) => {
  const response = await axios.post(`${API_URL}/entries/${id}/share/`);
  return response.data;
};

// Get journal statistics
export const fetchJournalStatistics = async () => {
  const response = await axios.get(`${API_URL}/entries/statistics/`);
  return response.data;
};