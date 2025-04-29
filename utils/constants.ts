// utils/constants.ts
import { EnergyLevel } from '../types/Mood';

/**
 * Get the color for a specific mood rating
 * @param rating The mood rating (1-10)
 * @returns A color string
 */
export const getMoodColor = (rating: number): string => {
  if (rating <= 2) return '#E53935'; // Red - Very bad mood
  if (rating <= 4) return '#FB8C00'; // Orange - Bad mood
  if (rating <= 6) return '#FDD835'; // Yellow - Neutral mood
  if (rating <= 8) return '#7CB342'; // Light green - Good mood
  return '#43A047'; // Green - Great mood
};

/**
 * Convert a mood rating to a description
 * @param rating The mood rating (1-10)
 * @returns A mood description
 */
export const getMoodDescription = (rating: number): string => {
  if (rating <= 2) return 'Very poor';
  if (rating <= 4) return 'Poor';
  if (rating <= 6) return 'Average';
  if (rating <= 8) return 'Good';
  return 'Excellent';
};

/**
 * List of common activities for mood tracking
 */
export const MOOD_ACTIVITIES = [
  'Socializing',
  'Family Time',
  'Working',
  'Studying',
  'Exercise',
  'Sports',
  'Relaxing',
  'Reading',
  'Watching TV/Movies',
  'Gaming',
  'Shopping',
  'Cooking',
  'Eating',
  'Traveling',
  'Hobby',
  'Social Media',
  'Health Issue',
  'Financial Concern',
  'Relationship',
  'Work Stress',
  'Meditation',
  'Therapy Session',
  'Other'
];

/**
 * Energy levels for mood tracking
 */
export const ENERGY_LEVELS = [
  { value: 1, label: 'Very Low' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'High' },
  { value: 5, label: 'Very High' }
];

// Map of energy level values to labels
export const ENERGY_LEVEL_LABELS: Record<EnergyLevel, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Very High'
};