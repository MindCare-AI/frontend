import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Chip, Text } from 'react-native-paper';
import { SectionHeader } from './SectionHeader';
import { globalStyles } from '../../styles/global';
import { MedicalInformation } from '../../API/settings/patient';

interface PatientInfoFormProps {
  initialData: Partial<MedicalInformation>;
  onSave: (data: Partial<MedicalInformation>) => Promise<void>;
  loading?: boolean;
}

export const PatientInfoForm: React.FC<PatientInfoFormProps> = ({
  initialData,
  onSave,
  loading = false,
}) => {
  const [medicalData, setMedicalData] = useState<Partial<MedicalInformation>>(initialData);
  const [newMedication, setNewMedication] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    setMedicalData(initialData);
  }, [initialData]);

  const handleChange = <K extends keyof MedicalInformation>(
    field: K, 
    value: MedicalInformation[K]
  ) => {
    setMedicalData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (
    field: keyof NonNullable<MedicalInformation['emergencyContact']>,
    value: string
  ) => {
    setMedicalData(prev => ({
      ...prev,
      emergencyContact: {
        ...(prev.emergencyContact || {}),
        [field]: value,
      },
    }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      const updatedMedications = [
        ...(medicalData.currentMedications || []),
        newMedication.trim(),
      ];
      handleChange('currentMedications', updatedMedications);
      setNewMedication('');
    }
  };

  const removeMedication = (medication: string) => {
    const updatedMedications = (medicalData.currentMedications || [])
      .filter(med => med !== medication);
    handleChange('currentMedications', updatedMedications);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      const updatedAllergies = [
        ...(medicalData.allergies || []),
        newAllergy.trim(),
      ];
      handleChange('allergies', updatedAllergies);
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    const updatedAllergies = (medicalData.allergies || [])
      .filter(a => a !== allergy);
    handleChange('allergies', updatedAllergies);
  };

  const handleSubmit = async () => {
    try {
      await onSave(medicalData);
    } catch (error) {
      console.error('Error saving medical information:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SectionHeader 
        title="Medical History" 
        description="Provide information about your medical background" 
      />

      <TextInput
        label="Medical History"
        value={medicalData.medicalHistory || ''}
        onChangeText={(value) => handleChange('medicalHistory', value)}
        style={styles.input}
        mode="outlined"
        multiline
        numberOfLines={4}
        disabled={loading}
      />

      <SectionHeader 
        title="Current Medications" 
        description="List all medications you are currently taking" 
      />

      <View style={styles.tagInputContainer}>
        <TextInput
          label="Add Medication"
          value={newMedication}
          onChangeText={setNewMedication}
          style={styles.tagInput}
          mode="outlined"
          disabled={loading}
          right={
            <TextInput.Icon 
              icon="plus" 
              onPress={addMedication} 
              disabled={!newMedication.trim() || loading} 
            />
          }
          onSubmitEditing={addMedication}
        />
      </View>

      <View style={styles.chipContainer}>
        {(medicalData.currentMedications || []).map((medication, index) => (
          <Chip
            key={`med-${index}`}
            style={styles.chip}
            onClose={() => removeMedication(medication)}
            disabled={loading}
          >
            {medication}
          </Chip>
        ))}
      </View>

      <SectionHeader 
        title="Allergies" 
        description="List any allergies you may have" 
      />

      <View style={styles.tagInputContainer}>
        <TextInput
          label="Add Allergy"
          value={newAllergy}
          onChangeText={setNewAllergy}
          style={styles.tagInput}
          mode="outlined"
          disabled={loading}
          right={
            <TextInput.Icon 
              icon="plus" 
              onPress={addAllergy} 
              disabled={!newAllergy.trim() || loading} 
            />
          }
          onSubmitEditing={addAllergy}
        />
      </View>

      <View style={styles.chipContainer}>
        {(medicalData.allergies || []).map((allergy, index) => (
          <Chip
            key={`allergy-${index}`}
            style={styles.chip}
            onClose={() => removeAllergy(allergy)}
            disabled={loading}
          >
            {allergy}
          </Chip>
        ))}
      </View>

      <SectionHeader 
        title="Emergency Contact" 
        description="Person to contact in case of emergency" 
      />

      <TextInput
        label="Full Name"
        value={medicalData.emergencyContact?.name || ''}
        onChangeText={(value) => handleEmergencyContactChange('name', value)}
        style={styles.input}
        mode="outlined"
        disabled={loading}
      />

      <TextInput
        label="Relationship"
        value={medicalData.emergencyContact?.relationship || ''}
        onChangeText={(value) => handleEmergencyContactChange('relationship', value)}
        style={styles.input}
        mode="outlined"
        disabled={loading}
      />

      <TextInput
        label="Phone Number"
        value={medicalData.emergencyContact?.phoneNumber || ''}
        onChangeText={(value) => handleEmergencyContactChange('phoneNumber', value)}
        style={styles.input}
        mode="outlined"
        keyboardType="phone-pad"
        disabled={loading}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Save Medical Information
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    marginBottom: 12,
    backgroundColor: globalStyles.colors.inputBackground,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: globalStyles.colors.inputBackground,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    margin: 4,
  },
  button: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: globalStyles.colors.primary,
  },
});