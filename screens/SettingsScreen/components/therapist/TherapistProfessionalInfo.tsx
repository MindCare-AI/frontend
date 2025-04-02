//screens/SettingsScreen/components/therapist/TherapistProfessionalInfo.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text } from 'react-native-paper';

export interface TherapistProfile {
  specialization: string;
  license_number: string;
  years_of_experience: number;
}

interface TherapistProfessionalInfoProps {
  profile: TherapistProfile;
  setProfile: (profile: TherapistProfile) => void;
}

export const TherapistProfessionalInfo: React.FC<TherapistProfessionalInfoProps> = ({ profile, setProfile }) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.sectionTitle}>
      Professional Information
    </Text>
    <TextInput
      label="Specialization"
      value={profile.specialization}
      onChangeText={text => setProfile({ ...profile, specialization: text })}
      style={styles.input}
    />
    <TextInput
      label="License Number"
      value={profile.license_number}
      onChangeText={text => {
        // Only update if the text is empty or matches the format AA-123456
        if (/^[A-Z]{2}-\d{6}$/.test(text) || text === '') {
          setProfile({ ...profile, license_number: text });
        }
      }}
      error={!!profile.license_number && !/^[A-Z]{2}-\d{6}$/.test(profile.license_number)}
      style={styles.input}
    />
    <TextInput
      label="Years of Experience"
      value={String(profile.years_of_experience)}
      onChangeText={text => setProfile({ ...profile, years_of_experience: parseInt(text) || 0 })}
      keyboardType="numeric"
      style={styles.input}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    marginBottom: 12,
  },
});