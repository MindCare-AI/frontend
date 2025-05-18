export type Mood = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';

export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';

export type Activity = 'exercise' | 'reading' | 'meditation' | 'socializing' | 'work' | 'rest' | 'entertainment' | 'other';

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood: Mood;
  mood_description?: string;
  date: string;
  created_at: string;
  updated_at: string;
  word_count: number;
  is_private: boolean;
  shared_with_therapist: boolean;
  weather: Weather;
  activities: string;
  username?: string;
}

export interface JournalStatistics {
  total_entries: number;
  entries_this_month: number;
  average_word_count: number;
  mood_distribution?: Record<Mood, number>;
  monthly_entry_counts?: Record<string, number>;
}

export interface JournalFilterParams {
  start_date?: string;
  end_date?: string;
  shared?: boolean;
  search?: string;
}

export interface ShareResponse {
  status: string;
  message: string;
}