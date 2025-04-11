export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface BaseProfile {
  id: number;
  user: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  profile_pic: string | null;
  created_at: string;
  updated_at: string;
}

// Add this new interface
export interface MedicalProfile {
  medical_history: string | null;
  current_medications: string | null;
  blood_type: string | null;
  treatment_plan?: string | null;
  pain_level?: number | null;
}

// Update PatientProfile to use MedicalProfile
export interface PatientProfile extends BaseProfile, MedicalProfile {
  user_name: string;
  last_appointment: string | null;
  next_appointment: string | null;
  emergency_contact?: EmergencyContact;
}

export interface TherapistProfile extends BaseProfile {
  username: string;
  specialization: string;
  license_number: string | null;
  years_of_experience: number;
  bio: string | null;
  treatment_approaches: Record<string, any>;
  available_days: Record<string, any>;
  license_expiry: string | null;
  video_session_link: string | null;
  languages_spoken: string[];
  profile_completion_percentage: number;
  is_profile_complete: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
}

export interface FullProfile extends BaseProfile {
  // Common fields that both profiles might have
  verification_status?: 'pending' | 'verified' | 'rejected';
  user_name?: string;
  username?: string;
  
  // Patient specific fields
  medical_history: string | null;
  current_medications: string | null;
  blood_type: string | null;
  treatment_plan: string | null;
  pain_level: number | null;
  last_appointment: string | null;
  next_appointment: string | null;
  emergency_contact?: EmergencyContact;
  
  // Therapist specific fields
  specialization?: string;
  license_number?: string | null;
  years_of_experience?: number;
  bio?: string | null;
  treatment_approaches?: Record<string, any>;
  available_days?: Record<string, any>;
  license_expiry?: string | null;
  video_session_link?: string | null;
  languages_spoken?: string[];
  profile_completion_percentage?: number;
  is_profile_complete?: boolean;
}