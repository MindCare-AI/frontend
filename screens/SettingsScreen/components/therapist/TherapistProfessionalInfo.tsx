//screens/SettingsScreen/components/therapist/TherapistProfessionalInfo.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';

export interface TherapistProfile {
  specialization: string;
  license_number: string;
  years_of_experience: number;
}

interface TherapistProfessionalInfoProps {
  profile: TherapistProfile;
  setProfile: (profile: TherapistProfile) => void;
}

export const TherapistProfessionalInfo: React.FC<TherapistProfessionalInfoProps> = ({ profile, setProfile }) => {
  const isLicenseNumberValid = (number: string) => /^[A-Z]{2}-\d{6}$/.test(number);
  const hasLicenseError = !!profile.license_number && !isLicenseNumberValid(profile.license_number);

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Professional Information
      </Text>
      
      <TextInput
        label="Specialization"
        value={profile.specialization}
        onChangeText={text => setProfile({ ...profile, specialization: text })}
        style={styles.input}
        mode="outlined"
      />
      
      <View>
        <TextInput
          label="License Number"
          value={profile.license_number || ''}
          onChangeText={text => {
            // Allow any input but uppercase letters automatically
            const formattedText = text.toUpperCase();
            setProfile({ ...profile, license_number: formattedText });
          }}
          error={hasLicenseError}
          style={styles.input}
          mode="outlined"
          placeholder="XX-123456"
        />
        <HelperText type={hasLicenseError ? "error" : "info"} visible={true}>
          {hasLicenseError 
            ? "Format should be: XX-123456 (e.g., AB-123456)" 
            : "Enter your license number in format: XX-123456"}
        </HelperText>
      </View>
      
      <TextInput
        label="Years of Experience"
        value={String(profile.years_of_experience)}
        onChangeText={text => {
          const years = parseInt(text) || 0;
          if (years >= 0 && years <= 100) {
            setProfile({ ...profile, years_of_experience: years });
          }
        }}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
        placeholder="Enter years of experience"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#002D62',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
});