//screens/SettingsScreen/components/patient/PatientMedicalInfo.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { bloodTypes } from '../../constants';

// Make sure the fields are optional to match what you're passing
export interface PatientProfile {
  medical_history?: string;
  current_medications?: string;
  blood_type?: string;
}

interface PatientMedicalInfoProps {
  profile: PatientProfile;
  setProfile: (profile: PatientProfile) => void;
}

export const PatientMedicalInfo: React.FC<PatientMedicalInfoProps> = ({ profile, setProfile }) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.sectionTitle}>
      Medical Information
    </Text>
    <TextInput
      label="Medical History"
      value={profile.medical_history || ''}
      onChangeText={text => setProfile({ ...profile, medical_history: text })}
      multiline
      style={styles.input}
    />
    <TextInput
      label="Current Medications"
      value={profile.current_medications || ''}
      onChangeText={text => setProfile({ ...profile, current_medications: text })}
      multiline
      style={styles.input}
    />
    <Picker
      selectedValue={profile.blood_type || ''}
      style={styles.input}
      onValueChange={(value: string) =>
        setProfile({ ...profile, blood_type: value })
      }>
      {bloodTypes.map(type => (
        <Picker.Item key={type} label={type} value={type} />
      ))}
    </Picker>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  sectionTitle: { marginBottom: 16 },
  input: { marginBottom: 16 }
});