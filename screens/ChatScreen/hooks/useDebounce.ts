// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

/**
 * Custom hook that debounces a value
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the debounce timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer on unmount or when value/delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;