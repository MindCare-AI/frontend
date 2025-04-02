import moment from 'moment-timezone';

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
export type Relationship = 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Friend' | 'Other';
export type NotificationType = 'reminders' | 'messages' | 'appointments' | 'updates' | 'marketing';

export const timezones: TimeZone[] = moment.tz.names().map(tz => ({
  value: tz,
  label: tz,
}));

export const colorSchemes: ColorScheme[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'red', label: 'Red' },
];

export const genderOptions: GenderOption[] = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
  { value: 'N', label: 'Prefer not to say' }
];

export const relationships: Relationship[] = [
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Other'
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