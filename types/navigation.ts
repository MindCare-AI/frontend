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
  AppointmentManagement: undefined;
  Notifications: undefined; // Add this
  NotificationDetail: { id: string }; // And this
  Settings: undefined;
  Appointments: undefined;
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

// New MessagingStackParamList to specify nested messaging routes
export type MessagingStackParamList = {
  Messaging: undefined;
  Chat: {
    conversationId: string | number;
    conversationType: 'one_to_one' | 'group';
    title: string;
    otherParticipantId?: number;
  };
  NewConversation: undefined;
  GroupDetails?: {
    groupId: string | number;
  };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  UserSettings: undefined;
  UserProfile: undefined;
  UserPreferences: undefined;
  TherapistAvailability: undefined;
  HealthMetrics: undefined;  // Added new screen
  MedicalHistory: undefined; // Added new screen
};

export type AppointmentStackParamList = {
  AppointmentManagement: undefined;
  BookAppointment: undefined;
};

// Add the Appointment interface export:
export interface Appointment {
  id: string;
  date: string;
  time?: string;
  patientName?: string;
  status?: string;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}