import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
  const [bloodTypeError, setBloodTypeError] = useState(false);
  
  const validateBloodType = (value: string) => {
    if (!value) return true;
    return bloodTypes.includes(value.toUpperCase());
  };

  const handleBloodTypeChange = (text: string) => {
    const isValid = validateBloodType(text);
    setBloodTypeError(!isValid);
    if (isValid) {
      setProfile({ ...profile, blood_type: text.toUpperCase() });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Medical Information</Text>
      
      <TextInput
        label="Medical History"
        value={profile.medical_history || ''}
        onChangeText={(text) => setProfile({ ...profile, medical_history: text })}
        multiline
        numberOfLines={4}
        style={[styles.input, styles.textArea]}
        placeholder="Enter any relevant medical history..."
      />

      <TextInput
        label="Current Medications"
        value={profile.current_medications || ''}
        onChangeText={(text) => setProfile({ ...profile, current_medications: text })}
        multiline
        style={[styles.input, styles.textArea]}
        placeholder="List your current medications..."
      />

      <View style={styles.row}>
        <View style={styles.bloodTypeContainer}>
          <TextInput
            label="Blood Type"
            value={profile.blood_type || ''}
            onChangeText={handleBloodTypeChange}
            style={[styles.input, styles.bloodTypeInput]}
            error={bloodTypeError}
            autoCapitalize="characters"
            placeholder="e.g., A+"
          />
          <HelperText type="info" visible={true} style={styles.helperText}>
            Valid types: {bloodTypes.join(', ')}
          </HelperText>
        </View>

        <TextInput
          label="Pain Level"
          value={profile.pain_level?.toString() ?? ''}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            if (!isNaN(num) && num >= 0 && num <= 10) {
              setProfile({ ...profile, pain_level: num });
            } else if (text === '') {
              setProfile({ ...profile, pain_level: undefined });
            }
          }}
          keyboardType="numeric"
          style={[styles.input, styles.painLevelInput]}
          placeholder="0-10"
          maxLength={2}
        />
      </View>

      <TextInput
        label="Treatment Plan"
        value={profile.treatment_plan || ''}
        onChangeText={(text) => setProfile({ ...profile, treatment_plan: text })}
        multiline
        numberOfLines={4}
        style={[styles.input, styles.textArea]}
        placeholder="Describe your current treatment plan..."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  input: {
    marginVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bloodTypeContainer: {
    flex: 0.6,
  },
  bloodTypeInput: {
    marginRight: 12,
  },
  painLevelInput: {
    flex: 0.35,
  },
  helperText: {
    fontSize: 12,
    color: '#666666',
    marginTop: -4,
  },
});