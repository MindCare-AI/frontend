export interface MoodEntry {
  id: number
  logged_at: Date
  created_at: Date
  updated_at: Date | null
  mood_rating: number
  energy_level: number
  activity: string
  has_journal: boolean
  journal_id?: number
  notes: string
  ai_flagged?: boolean
  ai_insights?: string
}

export type SortBy = "logged_at" | "created_at" | "mood_rating"
export type SortOrder = "asc" | "desc"

export interface FilterOptions {
  dateRange?: {
    from: Date
    to: Date
  }
  sortBy: SortBy
  sortOrder: SortOrder
  moodRange: [number, number]
  filterActivity: string
  searchText: string
}

export const ACTIVITIES = [
  "Exercise",
  "Meditation",
  "Reading",
  "Socializing",
  "Cooking",
  "Working",
  "Sleeping",
  "Walking",
  "Running",
  "Yoga",
  "Dancing",
  "Gaming",
  "Traveling",
  "Shopping",
  "Listening to Music",
  "Watching TV",
  "Gardening",
  "Art",
  "Writing",
  "Cleaning",
]

export const getMoodDescription = (rating: number): string => {
  if (rating <= 2) return "Very Low"
  if (rating <= 4) return "Low"
  if (rating <= 6) return "Moderate"
  if (rating <= 8) return "Good"
  return "Excellent"
}

export const getEnergyDescription = (level: number): string => {
  const labels = ["Very Low", "Low", "Moderate", "High", "Very High"]
  return labels[level - 1] || "Unknown"
}
