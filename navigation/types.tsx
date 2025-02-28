export type RootStackParamList = {
    Splash: undefined;
    Auth: undefined;
    App: undefined;
  };
  
  export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
    SetNewPassword: { uid: string; token: string };
  };
  
  export type AppStackParamList = {
    Main: undefined;
    Profile: undefined;
  };