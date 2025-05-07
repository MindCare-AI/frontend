//types/navigation.ts
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: { screen?: string; params?: object };
  App: undefined; // Nested navigator handles child params
  Home: undefined;
  Chatbot: undefined;
  MessagingTab: undefined;
  Profile: undefined;
  AppointmentManagement: { therapistId?: number }; // Changed from string to number
  Notifications: undefined; // Add this
  NotificationDetail: { id: number }; // Changed from string to number
  Settings: undefined;
  Appointments: undefined;
  PatientDashboard: undefined; // Added
  TherapistDashboard: undefined; // Added
};

export type AppTabParamList = {
  Feeds: undefined;
  Chatbot: undefined;
  Notifications: undefined;
  Settings: { userId?: string };
  Messaging: undefined; // Keep this if used in a different navigator
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  SetNewPassword: { 
    uid: string; 
    token: string;
  };
  Onboarding: undefined;
};

// Update MessagingStackParamList
export type MessagingStackParamList = {
  Messaging: undefined;
  Chat: {
    conversationId: string;
    conversationType: 'one_to_one' | 'group';
    title: string;
    otherParticipantId?: number;
  };
  NewConversation: undefined;
  GroupDetails?: {
    groupId: string;
  };
};

export type SettingsStackParamList = {
  Settings: undefined;
  AppSettings: undefined;
  TherapistProfile: undefined;
  PatientProfile: undefined;
  NotificationSettings: undefined;
  PatientMedicalInfo: undefined;
  Availability: undefined;
};

export type AppointmentStackParamList = {
  AppointmentManagement: undefined;
  BookAppointment: undefined;
  AppointmentConfirmation: undefined;
  TherapistProfile: undefined;
  TherapistAvailability: undefined;
  TherapistProfileEdit: undefined;
  TherapistProfileView: undefined;
  TherapistProfileViewEdit: undefined;
};

// Update Appointment interface
export interface Appointment {
  id: number; // Changed from string to number
  patient: number;
  therapist: number;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  duration: number;
}

// Add new interfaces
export interface Message {
  id: number;
  conversation: number;
  content: string;
  message_type: 'text' | 'image' | 'file';
  sender: number;
  sender_name: string;
  timestamp: string;
}

export interface Conversation {
  id: number;
  participants: number[];
  created_at: string;
  unread_count: number;
  last_message?: Message;
  other_participant?: number;
  other_user_name?: string;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}