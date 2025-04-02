import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import type { PatientProfile as MedicalProfile } from '../../../../types/profile';

interface PatientMedicalInfoProps {
  profile: Partial<MedicalProfile>;
  setProfile: (updatedInfo: Partial<MedicalProfile>) => void;
}

export const PatientMedicalInfo: React.FC<PatientMedicalInfoProps> = ({ 
  profile, 
  setProfile 
}) => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <View style={styles.container}>
      <TextInput
        label="Medical History"
        value={profile.medical_history || ''}
        onChangeText={(text) => setProfile({ ...profile, medical_history: text })}
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <TextInput
        label="Current Medications"
        value={profile.current_medications || ''}
        onChangeText={(text) => setProfile({ ...profile, current_medications: text })}
        multiline
        style={styles.input}
      />

      <View style={styles.row}>
        <View style={styles.bloodTypeContainer}>
          <TextInput
            label="Blood Type"
            value={profile.blood_type || ''}
            onChangeText={(text) => setProfile({ ...profile, blood_type: text })}
            style={[styles.input, styles.bloodTypeInput]}
            keyboardType="default"
          />
          <HelperText type="info" visible>
            Valid types: {bloodTypes.join(', ')}
          </HelperText>
        </View>

        <TextInput
          label="Pain Level (0-10)"
          value={profile.pain_level?.toString() ?? ''}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            if (!isNaN(num)) {
              setProfile({ ...profile, pain_level: Math.min(Math.max(num, 0), 10) });
            } else if (text === '') {
              setProfile({ ...profile, pain_level: undefined });
            }
          }}
          keyboardType="numeric"
          style={[styles.input, styles.painLevelInput]}
        />
      </View>

      <TextInput
        label="Treatment Plan"
        value={profile.treatment_plan || ''}
        onChangeText={(text) => setProfile({ ...profile, treatment_plan: text })}
        multiline
        numberOfLines={4}
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  input: {
    marginVertical: 8,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bloodTypeContainer: {
    flex: 0.6,
  },
  bloodTypeInput: {
    marginRight: 8,
  },
  painLevelInput: {
    flex: 0.35,
  },
});