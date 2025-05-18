/**
 * Comprehensive Therapist type that covers all use cases
 * across different components and screens
 */
export interface Therapist {
  id: number | string;
  first_name: string;
  last_name: string;
  full_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  specialty?: string;
  bio?: string;
  profile_picture?: string;
  image?: string;
  specializations?: string[];
  experience?: string;
  years_of_experience?: number;
  license_number?: string;
  license_expiry?: string;
  treatment_approaches?: string[] | Record<string, any>;
  languages?: string[];
  languages_spoken?: string[];
  rating?: number;
  total_ratings?: number;
  total_sessions?: number;
  profile_completion?: number;
  is_verified?: boolean;
  verification_status?: 'pending' | 'in_progress' | 'verified' | 'rejected';
  hourly_rate?: string | number;
  accepts_insurance?: boolean;
  insurance_providers?: string;
  session_duration?: number;
  available_days?: Record<string, any[]>;
  video_session_link?: string;
  tags?: string[];
  availability?: 'high' | 'medium' | 'low';
  // Additional fields used in various components
  [key: string]: any;
}