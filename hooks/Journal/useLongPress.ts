import { useRef, useCallback } from "react"

type UseLongPressOptions = {
  onLongPress: () => void
  onPress?: () => void
  threshold?: number
}

export function useLongPress({ onLongPress, onPress, threshold = 300 }: UseLongPressOptions) {
  // Using a ref to track if long press was triggered
  const longPressTriggeredRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handlePressIn = useCallback(() => {
    longPressTriggeredRef.current = false

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true
      onLongPress()
    }, threshold)
  }, [onLongPress, threshold])

  const handlePressOut = useCallback(() => {
    // Clear the timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // If long press wasn't triggered and we have an onPress handler, call it
    if (!longPressTriggeredRef.current && onPress) {
      onPress()
    }
  }, [onPress])

  return {
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
  }
}
