import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';

/**
 * Format a date string into a readable format
 * @param dateString ISO date string
 * @param formatStr Optional format string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a date and time string into a readable format
 * @param dateString ISO date string
 * @param formatStr Optional format string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string, formatStr: string = 'MMM dd, yyyy h:mm a'): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return dateString;
  }
};

/**
 * Get the start of the current week as ISO string
 * @returns Start of week ISO string
 */
export const getStartOfWeek = (): string => {
  return startOfWeek(new Date()).toISOString().split('T')[0];
};

/**
 * Get the end of the current week as ISO string
 * @returns End of week ISO string
 */
export const getEndOfWeek = (): string => {
  return endOfWeek(new Date()).toISOString().split('T')[0];
};

/**
 * Get the start of the current month as ISO string
 * @returns Start of month ISO string
 */
export const getStartOfMonth = (): string => {
  return startOfMonth(new Date()).toISOString().split('T')[0];
};

/**
 * Get the end of the current month as ISO string
 * @returns End of month ISO string
 */
export const getEndOfMonth = (): string => {
  return endOfMonth(new Date()).toISOString().split('T')[0];
};

/**
 * Get an array of previous months with their start and end dates
 * @param count Number of months to get
 * @returns Array of month objects with label, startDate and endDate
 */
export const getPreviousMonths = (count: number = 6) => {
  const months = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = subMonths(today, i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    months.push({
      label: format(date, 'MMMM yyyy'),
      startDate: monthStart.toISOString().split('T')[0],
      endDate: monthEnd.toISOString().split('T')[0],
    });
  }

  return months;
};

/**
 * Format a duration in minutes to a readable format
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
};