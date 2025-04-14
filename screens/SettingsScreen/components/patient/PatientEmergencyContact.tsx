//screens/SettingsScreen/components/patient/PatientEmergencyContact.tsx
import React, { useState } from 'react';
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
  const [phoneError, setPhoneError] = useState('');

  const handleChange = (field: keyof EmergencyContact, value: string) => {
    onEmergencyContactChange({
      ...emergencyContact,
      [field]: value,
    });
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (text: string) => {
    setPhoneError('');
    if (text && !validatePhone(text)) {
      setPhoneError('Please enter a valid phone number');
    }
    handleChange('phone', text);
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
        onChangeText={handlePhoneChange}
        keyboardType="phone-pad"
        style={[styles.input, phoneError ? styles.inputError : null]}
        mode="outlined"
        error={!!phoneError}
        helperText={phoneError}
      />
      {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
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
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
});