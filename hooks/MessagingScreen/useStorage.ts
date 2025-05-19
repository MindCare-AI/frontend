"use client"

import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getStoredValue = async () => {
      try {
        setLoading(true)
        const item = await AsyncStorage.getItem(key)
        const value = item ? JSON.parse(item) : initialValue
        setStoredValue(value)
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Unknown error in useStorage"))
        console.error("Error reading from AsyncStorage:", e)
      } finally {
        setLoading(false)
      }
    }

    getStoredValue()
  }, [key, initialValue])

  const setValue = async (value: T) => {
    try {
      setLoading(true)
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error in useStorage"))
      console.error("Error writing to AsyncStorage:", e)
    } finally {
      setLoading(false)
    }
  }

  const removeValue = async () => {
    try {
      setLoading(true)
      await AsyncStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error in useStorage"))
      console.error("Error removing from AsyncStorage:", e)
    } finally {
      setLoading(false)
    }
  }

  return { storedValue, setValue, removeValue, loading, error }
}
