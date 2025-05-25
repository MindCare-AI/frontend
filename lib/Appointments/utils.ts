import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Combines and merges class names using clsx and tailwind-merge
 * Useful for conditional class application and merging tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date into a readable string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Gets an authentication token from storage
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "scheduled":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "completed":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200"
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "missed":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200"
    case "rescheduled":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}
