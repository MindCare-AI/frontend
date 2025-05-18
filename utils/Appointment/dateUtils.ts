// src/utils/dateUtils.ts

import { format, isToday, isTomorrow, isAfter, isBefore, addMinutes, differenceInMinutes, parseISO } from 'date-fns';

/**
 * Formats a date to a readable string format
 * @param date The date to format
 * @param formatString The format string (defaults to 'MMMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, formatString: string = 'MMMM d, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

/**
 * Formats a time to a readable string format
 * @param date The date to extract time from
 * @param formatString The format string (defaults to 'h:mm a')
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string, formatString: string = 'h:mm a'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

/**
 * Formats a date and time to a readable string format
 * @param date The date to format
 * @param formatString The format string (defaults to 'MMMM d, yyyy h:mm a')
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string, formatString: string = 'MMMM d, yyyy h:mm a'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

/**
 * Returns a human-readable relative date string
 * @param date The date to format
 * @returns A string like "Today", "Tomorrow", or the formatted date
 */
export const getRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return 'Today';
  } else if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  } else {
    return format(dateObj, 'MMMM d, yyyy');
  }
};

/**
 * Checks if a date is in the past
 * @param date The date to check
 * @returns True if the date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(dateObj, new Date());
};

/**
 * Checks if a date is in the future
 * @param date The date to check
 * @returns True if the date is in the future
 */
export const isFutureDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(dateObj, new Date());
};

/**
 * Checks if a date is within a specified number of minutes from now
 * @param date The date to check
 * @param minutes The number of minutes
 * @returns True if the date is within the specified minutes
 */
export const isWithinMinutes = (date: Date | string, minutes: number): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const future = addMinutes(now, minutes);
  
  return isAfter(dateObj, now) && isBefore(dateObj, future);
};

/**
 * Checks if an appointment is starting soon (within 15 minutes)
 * @param date The appointment date and time
 * @returns True if the appointment is starting within 15 minutes
 */
export const isAppointmentStartingSoon = (date: Date | string): boolean => {
  return isWithinMinutes(date, 15);
};

/**
 * Gets the minutes remaining until a date
 * @param date The target date
 * @returns Number of minutes remaining
 */
export const getMinutesRemaining = (date: Date | string): number => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  
  if (isBefore(dateObj, now)) {
    return 0;
  }
  
  return differenceInMinutes(dateObj, now);
};

/**
 * Combines a date and time string into a Date object
 * @param dateStr The date string (YYYY-MM-DD)
 * @param timeStr The time string (HH:MM)
 * @returns A Date object
 */
export const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  return new Date(year, month - 1, day, hours, minutes);
};

/**
 * Formats a date range
 * @param startDate The start date
 * @param endDate The end date
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: Date | string, endDate: Date | string): string => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    // Same day
    return `${format(start, 'MMMM d, yyyy')} ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  } else {
    // Different days
    return `${format(start, 'MMMM d, yyyy h:mm a')} - ${format(end, 'MMMM d, yyyy h:mm a')}`;
  }
};