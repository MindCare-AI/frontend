"use client"

import { createContext, useState, useContext, useCallback, type ReactNode } from "react"
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

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching categories...")
      const response = await fetchJournalCategories()
      console.log("Categories response:", response)
      console.log("Categories response type:", typeof response)
      console.log("Categories response is array:", Array.isArray(response))
      
      // Ensure response is an array
      const categoriesArray = Array.isArray(response) ? response : []
      console.log("Setting journals to:", categoriesArray)
      setJournals(categoriesArray)
    } catch (err: any) {
      const errorMessage = "Failed to fetch categories"
      setError(errorMessage)
      console.error("Error fetching categories:", err)
      
      // Log more details about the error
      if (err.response) {
        console.error("Error response data:", err.response.data)
        console.error("Error response status:", err.response.status)
      }
      
      setJournals([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching entries...")
      const response = await fetchJournalEntries()
      console.log("Entries response:", response)
      console.log("Entries response type:", typeof response)
      console.log("Entries response is array:", Array.isArray(response))
      
      // Ensure response is an array
      const entriesArray = Array.isArray(response) ? response : []
      console.log("Setting entries to:", entriesArray)
      setEntries(entriesArray)
    } catch (err: any) {
      const errorMessage = "Failed to fetch entries"
      setError(errorMessage)
      console.error("Error fetching entries:", err)
      
      // Log more details about the error
      if (err.response) {
        console.error("Error response data:", err.response.data)
        console.error("Error response status:", err.response.status)
      }
      
      setEntries([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [])

  const addJournal = useCallback(async (journal: Omit<Journal, "id" | "created_at" | "updated_at" | "user">) => {
    try {
      setLoading(true)
      setError(null)
      console.log("Creating journal with data:", journal)
      
      const response = await createJournalCategory(journal)
      console.log("Journal creation response:", response)
      
      setJournals(prev => [...prev, response])
      return response
    } catch (err: any) {
      const errorMessage = "Failed to add journal"
      setError(errorMessage)
      console.error("Error adding journal:", err)
      
      // Log more details about the error
      if (err.response) {
        console.error("Error response data:", err.response.data)
        console.error("Error response status:", err.response.status)
        console.error("Error response headers:", err.response.headers)
      } else if (err.request) {
        console.error("Error request:", err.request)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateJournal = useCallback(async (id: number, journal: Partial<Journal>) => {
    try {
      setLoading(true)
      setError(null)
      const response = await updateJournalCategory(id, journal)
      setJournals(prev => prev.map(j => j.id === id ? { ...j, ...response } : j))
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
      setJournals(prev => prev.filter(j => j.id !== id))
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
      setEntries(prev => [...prev, response])
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
      setEntries(prev => prev.map(e => e.id === id ? { ...e, ...response } : e))
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
      setEntries(prev => prev.filter(e => e.id !== id))
      setError(null)
    } catch (err) {
      setError("Failed to delete entry")
      console.error("Error deleting entry:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

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
