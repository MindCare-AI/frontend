//types/navigation.ts
export type RootStackParamList = {
  Splash: undefined;
  Auth: { screen: keyof AuthStackParamList } | undefined;
  Onboarding: undefined;
  App: {
    screen: keyof MessagingStackParamList;
    params?: MessagingStackParamList[keyof MessagingStackParamList];
  } | undefined;
};

export type AppTabParamList = {
  Feeds: undefined;
  Chatbot: undefined;
  Notifications: undefined;
  Settings: { userId?: string };
  Messaging: undefined; // Keep this if you use it in a different navigator
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

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}