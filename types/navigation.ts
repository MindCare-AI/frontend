//types/navigation.ts
export type RootStackParamList = {
  Splash: undefined;
  Auth: { screen?: keyof AuthStackParamList };
  App: { screen?: keyof AppStackParamList };
};

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  Welcome: undefined;
  Settings: undefined;
};