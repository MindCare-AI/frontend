//navigation/types.tsx
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: { screen?: string; params?: object };
  App: { screen?: string; params?: object };
};

export type AppStackParamList = {
  Feeds: undefined;
  Chatbot: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  SetNewPassword: { uid: string; token: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  UserSettings: undefined;
  UserProfile: undefined;
  UserPreferences: undefined;
  TherapistAvailability: undefined;
  HealthMetrics: undefined; // Add this
  MedicalHistory: undefined; // Add this
};