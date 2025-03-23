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