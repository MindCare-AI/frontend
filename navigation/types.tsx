import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

// Stack navigator types
export type FeedsStackParamList = {
  FeedsList: undefined;
  CreatePost: undefined;
};

//navigation/types.tsx
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: { screen?: string; params?: object };
  App: { screen?: keyof AppStackParamList; params?: object };
  Appointments: { screen: keyof AppointmentStackParamList; params?: undefined };
  BookAppointment: undefined;
  Messaging: undefined;
  Chat: {
    id: string;
    highlightMessageId?: string;
  };
  MoodTracker: { screen?: keyof MoodTrackerParamList; params?: object };
  Main: undefined;
};

export type AppStackParamList = {
  Feeds: {
    screen?: keyof FeedsStackParamList;
    params?: object;
  };
  Chatbot: undefined;
  Notifications: undefined;
  Settings: undefined;
  MoodTracker: undefined;
  Appointments: undefined;
  Journal: undefined;
  Messaging: undefined;
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
  PatientDashboard: undefined;
  TherapistDashboard: undefined;
  TherapistAvailability: undefined;
  TherapistWaitingList: undefined;
  AppointmentConfirmation: undefined;
  Reschedule: { appointmentId: number };
  OfferSlot: { entryId: number };
  Messaging: { patientId: number };
  StartSession: { appointmentId: number };
  CancelAppointment: { appointmentId: number };
  ConfirmAppointment: { appointmentId: number };
  SuggestTime: { appointmentId: number };
  DeclineAppointment: { appointmentId: number };
};

// Updated Messaging navigation types
export type MessagingStackParamList = {
  Home: undefined;
  Chat: { 
    id: string;
    highlightMessageId?: string;
  };
  Profile: { id: string };
  NewConversation: undefined;
  NewGroup: undefined;
  Search: { conversationId?: string };
  MediaGallery: { id: string };
  GroupMembers: { id: string };
  Settings: undefined;
  NotificationSettings: undefined;
  MessagingSettings: { conversationId?: string; conversationType?: 'one_to_one' | 'group' };
  Messaging: undefined;
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
  MainTabs: undefined;
  NewEntry: undefined;
  EditEntry: { entry: any };
  Details: { entry: any };
};

export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Appointments: undefined;
};

// Messaging Screen Navigation Props
export type HomeScreenNavigationProp = StackNavigationProp<MessagingStackParamList, "Home">;
export type ChatScreenNavigationProp = StackNavigationProp<MessagingStackParamList, "Chat">;
export type ProfileScreenNavigationProp = StackNavigationProp<MessagingStackParamList, "Profile">;
export type NewConversationScreenNavigationProp = StackNavigationProp<MessagingStackParamList, "NewConversation">;
export type NewGroupScreenNavigationProp = StackNavigationProp<MessagingStackParamList, "NewGroup">;
export type SearchScreenNavigationProp = StackNavigationProp<MessagingStackParamList, "Search">;
export type MediaGalleryScreenNavigationProp = StackNavigationProp<MessagingStackParamList, "MediaGallery">;
export type GroupMembersScreenNavigationProp = StackNavigationProp<MessagingStackParamList, "GroupMembers">;
export type SettingsScreenNavigationProp = StackNavigationProp<MessagingStackParamList, "Settings">;
export type NotificationSettingsScreenNavigationProp = StackNavigationProp<MessagingStackParamList, "NotificationSettings">;
export type MessagingSettingsScreenNavigationProp = StackNavigationProp<MessagingStackParamList, "MessagingSettings">;

// Messaging Screen Route Props
export type ChatScreenRouteProp = RouteProp<MessagingStackParamList, "Chat">;
export type ProfileScreenRouteProp = RouteProp<MessagingStackParamList, "Profile">;
export type MediaGalleryScreenRouteProp = RouteProp<MessagingStackParamList, "MediaGallery">;
export type GroupMembersScreenRouteProp = RouteProp<MessagingStackParamList, "GroupMembers">;
export type SearchScreenRouteProp = RouteProp<MessagingStackParamList, "Search">;
export type MessagingSettingsScreenRouteProp = RouteProp<MessagingStackParamList, "MessagingSettings">;