export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface BaseProfile {
  id: number;
  user: number;
  email: string;
  phone_number: string | null;
  profile_pic: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile extends BaseProfile {
  user_name: string;
  first_name: string;
  last_name: string;
  medical_history: string | null;
  current_medications: string | null;
  blood_type: string | null;
  treatment_plan: string | null;
  pain_level: number | null;
  last_appointment: string | null;
  next_appointment: string | null;
  emergency_contact?: EmergencyContact;
}

export interface TherapistProfile extends BaseProfile {
  username: string;
  first_name: string;
  last_name: string;
  specialization: string;
  license_number: string | null;
  years_of_experience: number;
  bio: string | null;
  treatment_approaches: string[] | Record<string, any>;
  available_days: {
    [key: string]: any[];  // monday: [], tuesday: [], etc.
  };
  license_expiry: string | null;
  video_session_link: string | null;
  languages_spoken: string[];
  profile_completion_percentage: number;
  is_profile_complete: boolean;
  verification_status: 'pending' | 'in_progress' | 'verified' | 'rejected';
}

export type FullProfile = PatientProfile | TherapistProfile;