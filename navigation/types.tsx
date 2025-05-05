//navigation/types.tsx
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: { screen?: string; params?: object };
  App: { screen?: keyof AppStackParamList; params?: object };
  Appointments: { screen: keyof AppointmentStackParamList; params?: undefined }; // Simplified to align with expected structure
  BookAppointment: undefined;
  Messaging: undefined;
  Chat: {
    conversationId: string;
    conversationType: 'one_to_one' | 'group';
    title: string;
    otherParticipantId?: number;
  };
  MoodTracker: { screen?: keyof MoodTrackerParamList; params?: object };
};

export type AppStackParamList = {
  Feeds: undefined;
  Chatbot: undefined;
  Notifications: undefined;
  Settings: undefined;
  MoodTracker: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  SetNewPassword: { uid: string; token: string };
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
};

export type MessagingStackParamList = {
  Messaging: undefined;
  Chat: {
    conversationId: string;
    conversationType: 'one_to_one' | 'group';
    title: string;
    otherParticipantId?: number;
  };
  NewChat: undefined;
};

export type MoodTrackerParamList = {
  MoodTabs: undefined;
  MoodHome: undefined;
  MoodHistory: undefined;
  MoodAnalytics: undefined;
  LogMood: { 
    moodId?: number; 
    initialValues?: { 
      mood_rating?: number; 
      energy_level?: number; 
      activities?: string;
    } 
  };
};