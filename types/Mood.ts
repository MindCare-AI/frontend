// types/Mood.ts
export interface MoodLog {
  id: number;
  user: number;
  mood_rating: number;
  energy_level: number;
  activities: string;
  journal_entry_id: number | null;
  is_journaled: boolean;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export interface MoodAnalytics {
  weekly_average: number;
  monthly_average: number;
  daily_trends: {
    day: string;
    avg_mood: number;
  }[];
  entry_count: number;
}

export enum EnergyLevel {
  VeryLow = 1,
  Low = 2,
  Moderate = 3,
  High = 4,
  VeryHigh = 5
}

export const EnergyLevelLabels: Record<EnergyLevel, string> = {
  [EnergyLevel.VeryLow]: "Very Low",
  [EnergyLevel.Low]: "Low",
  [EnergyLevel.Moderate]: "Moderate",
  [EnergyLevel.High]: "High",
  [EnergyLevel.VeryHigh]: "Very High"
};

export interface MoodFormData {
  mood_rating: number;
  energy_level: number;
  activities: string;
}

export interface MoodFilters {
  startDate?: string;
  endDate?: string;
  minRating?: number;
  maxRating?: number;
  activities?: string;
}