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
  Notifications: undefined;
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
  Chat: {
    conversationId: string | number;
    conversationType: 'one_to_one' | 'group';
    title: string;
    otherParticipantId?: number;
  };
};

export type SettingsStackParamList = {
  SettingsScreen: undefined;
  UserPreferences: undefined;
  UserSettings: undefined;
  UserProfile: undefined;
};

export type AppointmentStackParamList = {
  AppointmentManagement: undefined;
  BookAppointment: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}