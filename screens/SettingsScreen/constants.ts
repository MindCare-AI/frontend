import moment from 'moment-timezone';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type TimeZone = {
  value: string;
  label: string;
};

export type ColorScheme = {
  value: string;
  label: string;
};

export type GenderOption = {
  value: 'M' | 'F' | 'O' | 'N';
  label: string;
};

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type NotificationType = 'reminders' | 'messages' | 'appointments' | 'updates' | 'marketing';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'pending';
export type UserType = 'patient' | 'therapist';

export const timezones: TimeZone[] = moment.tz.names().map(tz => ({
  value: tz,
  label: tz,
}));

export const colorSchemes: ColorScheme[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export const genderOptions: GenderOption[] = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
  { value: 'N', label: 'Prefer not to say' }
];

export const bloodTypes: BloodType[] = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export const notificationTypes: NotificationType[] = [
  'reminders',
  'messages', 
  'appointments',
  'updates',
  'marketing'
];

export const verificationStatuses: VerificationStatus[] = [
  'pending',
  'verified',
  'rejected'
];

export const appointmentStatuses: AppointmentStatus[] = [
  'scheduled',
  'completed',
  'cancelled',
  'pending'
];

export const userTypes: UserType[] = [
  'patient',
  'therapist'
];

// Add the relationships array for emergency contacts
export const relationships: string[] = ['Parent', 'Sibling', 'Spouse', 'Friend', 'Other'];

export const triggerHaptics = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

export const treatmentApproachOptions: string[] = ['CBT', 'DBT'];