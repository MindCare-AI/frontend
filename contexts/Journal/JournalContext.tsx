"use client"

import { createContext, useState, useContext, type ReactNode } from "react"
import type { Journal, JournalEntry } from "../../types/Journal/index"

type JournalContextType = {
  journals: Journal[]
  entries: JournalEntry[]
  addJournal: (journal: Omit<Journal, "id">) => void
  updateJournal: (journal: Journal) => void
  deleteJournal: (id: number) => void
  addEntry: (entry: Omit<JournalEntry, "id" | "date">) => void
  updateEntry: (entry: JournalEntry) => void
  deleteEntry: (id: number) => void
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
  const [journals, setJournals] = useState<Journal[]>([
    {
      id: 1,
      title: "Wish Journal",
      entries: 13,
      color: "#4287f5",
    },
    {
      id: 2,
      title: "Emotions Journal",
      entries: 24,
      color: "#43d9b8",
      icon: "💭",
    },
    {
      id: 3,
      title: "Fear Journal",
      entries: 9,
      color: "#f54242",
    },
    {
      id: 4,
      title: "Gratitude Journal",
      entries: 36,
      color: "#f5a742",
    },
    {
      id: 5,
      title: "Questions Journal",
      entries: 7,
      color: "#424242",
    },
  ])

  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: 101,
      journalId: 1,
      content: "I wish I could travel to Japan next year.",
      date: new Date(2023, 5, 15),
    },
    {
      id: 102,
      journalId: 1,
      content: "I hope to learn a new language this year.",
      date: new Date(2023, 6, 20),
    },
    {
      id: 201,
      journalId: 2,
      content: "Today I felt really happy about my progress on the project.",
      date: new Date(2023, 7, 5),
    },
    {
      id: 301,
      journalId: 3,
      content: "I'm worried about the upcoming presentation.",
      date: new Date(2023, 8, 10),
    },
    {
      id: 401,
      journalId: 4,
      content: "I'm grateful for my supportive friends and family.",
      date: new Date(2023, 9, 12),
    },
  ])

  const addJournal = (journal: Omit<Journal, "id">) => {
    const newJournal = {
      ...journal,
      id: Date.now(),
    }
    setJournals([...journals, newJournal])
  }

  const updateJournal = (updatedJournal: Journal) => {
    setJournals(journals.map((journal) => (journal.id === updatedJournal.id ? updatedJournal : journal)))
  }

  const deleteJournal = (id: number) => {
    setJournals(journals.filter((journal) => journal.id !== id))
    setEntries(entries.filter((entry) => entry.journalId !== id))
  }

  const addEntry = (entry: Omit<JournalEntry, "id" | "date">) => {
    const newEntry = {
      ...entry,
      id: Date.now(),
      date: new Date(),
    }
    setEntries([...entries, newEntry])

    // Update journal entry count
    setJournals(
      journals.map((journal) =>
        journal.id === entry.journalId ? { ...journal, entries: journal.entries + 1 } : journal,
      ),
    )
  }

  const updateEntry = (updatedEntry: JournalEntry) => {
    setEntries(entries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
  }

  const deleteEntry = (id: number) => {
    const entryToDelete = entries.find((entry) => entry.id === id)
    if (entryToDelete) {
      setEntries(entries.filter((entry) => entry.id !== id))

      // Update journal entry count
      setJournals(
        journals.map((journal) =>
          journal.id === entryToDelete.journalId ? { ...journal, entries: journal.entries - 1 } : journal,
        ),
      )
    }
  }

  return (
    <JournalContext.Provider
      value={{
        journals,
        entries,
        addJournal,
        updateJournal,
        deleteJournal,
        addEntry,
        updateEntry,
        deleteEntry,
      }}
    >
      {children}
    </JournalContext.Provider>
  )
}
