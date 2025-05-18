"use client"

import { useState, useEffect } from "react"
import { isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { mockMoodLogs } from "../../data/moodtrack/mockData"
import type { MoodEntry, FilterOptions } from "../../types/mood/mood"

export const useMoodData = (filterOptions: FilterOptions) => {
  const [filteredLogs, setFilteredLogs] = useState<MoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)

    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        let result = [...mockMoodLogs]

        // Filter by date range
        if (filterOptions.dateRange?.from && filterOptions.dateRange?.to) {
          const fromDate = startOfDay(filterOptions.dateRange.from)
          const toDate = endOfDay(filterOptions.dateRange.to)

          result = result.filter((log) => {
            return isWithinInterval(log.logged_at, {
              start: fromDate,
              end: toDate,
            })
          })
        }

        // Filter by mood range
        result = result.filter(
          (log) => log.mood_rating >= filterOptions.moodRange[0] && log.mood_rating <= filterOptions.moodRange[1],
        )

        // Filter by activity
        if (filterOptions.filterActivity !== "all") {
          result = result.filter((log) => log.activity.toLowerCase() === filterOptions.filterActivity.toLowerCase())
        }

        // Filter by search text
        if (filterOptions.searchText) {
          const searchLower = filterOptions.searchText.toLowerCase()
          result = result.filter((log) => log.notes.toLowerCase().includes(searchLower))
        }

        // Sort logs
        result.sort((a, b) => {
          let comparison = 0

          if (filterOptions.sortBy === "logged_at") {
            comparison = a.logged_at.getTime() - b.logged_at.getTime()
          } else if (filterOptions.sortBy === "created_at") {
            comparison = a.created_at.getTime() - b.created_at.getTime()
          } else if (filterOptions.sortBy === "mood_rating") {
            comparison = a.mood_rating - b.mood_rating
          }

          return filterOptions.sortOrder === "asc" ? comparison : -comparison
        })

        setFilteredLogs(result)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load mood data. Please try again.")
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [filterOptions])

  return { filteredLogs, isLoading, error }
}
