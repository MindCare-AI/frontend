//types/navigation.ts
export type RootStackParamList = {
  Splash: undefined;
  Auth: { screen?: keyof AuthStackParamList };
  App: { screen?: keyof AppTabParamList };
};

export type AppTabParamList = {
  Feeds: undefined;
  Chatbot: undefined;
  Notifications: undefined;
  Settings: {
    userId?: string;
  };
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

// Remove AppStackParamList since we're using AppTabParamList for main navigation

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}