export type Journal = {
  id: number
  title: string
  entries: number
  color: string
  icon?: string | null
}

export type JournalEntry = {
  id: number
  journalId: number
  content: string
  date: Date
}
