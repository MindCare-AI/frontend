//types/navigation.ts
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  App: undefined;
  Home: undefined;
  // ... other routes
};

export type AppTabParamList = {
  Feeds: undefined;
  Chatbot: undefined;
  Notifications: undefined;
  Settings: {
    userId?: string;
  };
  Messaging: undefined; // Add this line
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  SetNewPassword: { 
    uid: string; 
    token: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}