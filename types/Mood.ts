export type MoodRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodLog {
  id: number;
  user: number;
  mood_rating: MoodRating;
  energy_level?: EnergyLevel;
  activities?: string;
  journal_entry_id?: number;
  is_journaled: boolean;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export interface MoodFormData {
  mood_rating: MoodRating;
  energy_level?: EnergyLevel;
  activities?: string;
  logged_at?: string;
}

export interface MoodFilters {
  startDate?: string;
  endDate?: string;
  minRating?: number;
  maxRating?: number;
  activities?: string;
  searchText?: string;
}

export interface MoodAnalytics {
  weekly_average: number;
  monthly_average: number;
  daily_trends: DailyMood[];
  entry_count: number;
}

export interface DailyMood {
  day: string;
  avg_mood: number;
}
