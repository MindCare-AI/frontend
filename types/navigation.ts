//types/navigation.ts
export type RootStackParamList = {
    Splash: undefined;
    Auth: { screen: keyof AuthStackParamList } | undefined; // updated to accept nested parameters
    Onboarding: undefined;
    App: { screen: string } | undefined; // updated to accept nested parameters
};

export type AppTabParamList = {
    Feeds: undefined;
    Chatbot: undefined;
    Notifications: undefined;
    Settings: { userId?: string };
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
    Onboarding: undefined; // Add this line to include Onboarding as a valid screen in the Auth stack
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}