export type Journal = {
  id: number;
  name: string;
  user: number;
  created_at: string;
  updated_at: string;
  entries_count?: number;
  title?: string;
  color?: string;
  icon?: string | null;
}

export type JournalEntry = {
  id: number;
  title?: string;
  content: string;
  mood?: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  mood_description?: string;
  date: string;
  created_at: string;
  updated_at: string;
  word_count: number;
  is_private: boolean;
  shared_with_therapist: boolean;
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  activities?: string;
  user: number;
  category?: number;
  category_name?: string;
}
