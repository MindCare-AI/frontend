"use client"

import { createContext, useState, useContext, useCallback, useEffect, type ReactNode } from "react"
import type { Journal, JournalEntry } from "../../types/Journal/index"
import {
  fetchJournalEntries,
  fetchJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  fetchJournalCategories,
  createJournalCategory,
  updateJournalCategory,
  deleteJournalCategory
} from "../../API/journal"

type JournalContextType = {
  journals: Journal[]
  entries: JournalEntry[]
  loading: boolean
  error: string | null
  addJournal: (journal: Omit<Journal, "id" | "created_at" | "updated_at" | "user">) => Promise<Journal>
  updateJournal: (id: number, journal: Partial<Journal>) => Promise<Journal>
  deleteJournal: (id: number) => Promise<void>
  addEntry: (entry: Omit<JournalEntry, "id" | "date" | "created_at" | "updated_at" | "user" | "word_count">) => Promise<JournalEntry>
  updateEntry: (id: number, entry: Partial<JournalEntry>) => Promise<JournalEntry>
  deleteEntry: (id: number) => Promise<void>
  fetchEntries: () => Promise<void>
  fetchCategories: () => Promise<void>
}

const JournalContext = createContext<JournalContextType | undefined>(undefined)

export const useJournal = () => {
  const context = useContext(JournalContext)
  if (context === undefined) {
    throw new Error("useJournal must be used within a JournalProvider")
  }
  return context
}

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const [journals, setJournals] = useState<Journal[]>([])
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchJournalCategories()
      setJournals(response)
      setError(null)
    } catch (err) {
      setError("Failed to fetch categories")
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchJournalEntries()
      // Ensure response is an array before setting the state
      setEntries(Array.isArray(response) ? response : [])
      setError(null)
    } catch (err) {
      setError("Failed to fetch entries")
      console.error("Error fetching entries:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addJournal = useCallback(async (journal: Omit<Journal, "id" | "created_at" | "updated_at" | "user">) => {
    try {
      setLoading(true)
      const response = await createJournalCategory(journal)
      setJournals(prev => Array.isArray(prev) ? [...prev, response] : [response])
      setError(null)
      return response
    } catch (err) {
      setError("Failed to add journal")
      console.error("Error adding journal:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateJournal = useCallback(async (id: number, journal: Partial<Journal>) => {
    try {
      setLoading(true)
      const response = await updateJournalCategory(id, journal)
      setJournals(prev => Array.isArray(prev) 
        ? prev.map(j => j.id === id ? { ...j, ...response } : j)
        : [response])
      setError(null)
      return response
    } catch (err) {
      setError("Failed to update journal")
      console.error("Error updating journal:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteJournal = useCallback(async (id: number) => {
    try {
      setLoading(true)
      await deleteJournalCategory(id)
      setJournals(prev => Array.isArray(prev) ? prev.filter(j => j.id !== id) : [])
      setError(null)
    } catch (err) {
      setError("Failed to delete journal")
      console.error("Error deleting journal:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const addEntry = useCallback(async (entry: Omit<JournalEntry, "id" | "date" | "created_at" | "updated_at" | "user" | "word_count">) => {
    try {
      setLoading(true)
      const response = await createJournalEntry(entry)
      setEntries(prev => Array.isArray(prev) ? [...prev, response] : [response])
      setError(null)
      return response
    } catch (err) {
      setError("Failed to add entry")
      console.error("Error adding entry:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateEntry = useCallback(async (id: number, entry: Partial<JournalEntry>) => {
    try {
      setLoading(true)
      const response = await updateJournalEntry(id, entry)
      setEntries(prev => Array.isArray(prev) 
        ? prev.map(e => e.id === id ? { ...e, ...response } : e) 
        : [response])
      setError(null)
      return response
    } catch (err) {
      setError("Failed to update entry")
      console.error("Error updating entry:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteEntry = useCallback(async (id: number) => {
    try {
      setLoading(true)
      await deleteJournalEntry(id)
      setEntries(prev => Array.isArray(prev) ? prev.filter(e => e.id !== id) : [])
      setError(null)
    } catch (err) {
      setError("Failed to delete entry")
      console.error("Error deleting entry:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialized) {
      Promise.all([fetchCategories(), fetchEntries()])
        .then(() => setInitialized(true))
        .catch(console.error)
    }
  }, [initialized, fetchCategories, fetchEntries])

  const value = {
    journals,
    entries,
    loading,
    error,
    addJournal,
    updateJournal,
    deleteJournal,
    addEntry,
    updateEntry,
    deleteEntry,
    fetchEntries,
    fetchCategories
  }

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  )
}
