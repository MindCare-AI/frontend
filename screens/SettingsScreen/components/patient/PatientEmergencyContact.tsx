//screens/SettingsScreen/components/patient/PatientEmergencyContact.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { relationships } from '../../constants';
import { EmergencyContact } from '../../../../types/profile';

interface PatientEmergencyContactProps {
  emergencyContact: EmergencyContact;
  onEmergencyContactChange: (contact: EmergencyContact) => void;
}

export const PatientEmergencyContact: React.FC<PatientEmergencyContactProps> = ({
  emergencyContact,
  onEmergencyContactChange,
}) => {
  const handleChange = (field: keyof EmergencyContact, value: string) => {
    onEmergencyContactChange({
      ...emergencyContact,
      [field]: value,
    });
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Emergency Contact
      </Text>
      
      <TextInput
        label="Contact Name"
        value={emergencyContact.name || ''}
        onChangeText={(text) => handleChange('name', text)}
        style={styles.input}
        mode="outlined"
      />
      
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={emergencyContact.relationship || ''}
          onValueChange={(value) => handleChange('relationship', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Relationship" value="" />
          {relationships.map((rel) => (
            <Picker.Item key={rel} label={rel} value={rel} />
          ))}
        </Picker>
      </View>
      
      <TextInput
        label="Phone Number"
        value={emergencyContact.phone || ''}
        onChangeText={(text) => handleChange('phone', text)}
        keyboardType="phone-pad"
        style={styles.input}
        mode="outlined"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});