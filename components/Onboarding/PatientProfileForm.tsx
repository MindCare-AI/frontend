import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView } from 'react-native';

interface PatientProfileFormProps {
  onSubmit: (data: any) => void;
  onSkip: () => void;
}

const PatientProfileForm: React.FC<PatientProfileFormProps> = ({ onSubmit, onSkip }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    blood_type: '',
    medical_history: '',
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={form.first_name}
        onChangeText={v => handleChange('first_name', v)}
        placeholder="First Name"
      />
      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={form.last_name}
        onChangeText={v => handleChange('last_name', v)}
        placeholder="Last Name"
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={form.email}
        onChangeText={v => handleChange('email', v)}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={form.phone_number}
        onChangeText={v => handleChange('phone_number', v)}
        placeholder="Phone Number"
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Blood Type</Text>
      <TextInput
        style={styles.input}
        value={form.blood_type}
        onChangeText={v => handleChange('blood_type', v)}
        placeholder="Blood Type"
      />
      <Text style={styles.label}>Medical History</Text>
      <TextInput
        style={styles.input}
        value={form.medical_history}
        onChangeText={v => handleChange('medical_history', v)}
        placeholder="Medical History"
        multiline
      />
      <View style={styles.buttonRow}>
        <Button title="Skip" onPress={onSkip} />
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 4 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
});

export default PatientProfileForm;