import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView } from 'react-native';

interface TherapistProfileFormProps {
  onSubmit: (data: any) => void;
  onSkip: () => void;
  allowSkipVerification?: boolean;
}

const TherapistProfileForm: React.FC<TherapistProfileFormProps> = ({ onSubmit, onSkip }) => {
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    specialization: '',
    license_number: '',
    years_of_experience: '',
    bio: '',
    languages_spoken: '',
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      years_of_experience: Number(form.years_of_experience),
      languages_spoken: form.languages_spoken.split(',').map(l => l.trim()),
    };
    onSubmit(data);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={form.username}
        onChangeText={v => handleChange('username', v)}
        placeholder="Username"
        autoCapitalize="none"
      />
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
      <Text style={styles.label}>Specialization</Text>
      <TextInput
        style={styles.input}
        value={form.specialization}
        onChangeText={v => handleChange('specialization', v)}
        placeholder="Specialization"
      />
      <Text style={styles.label}>License Number</Text>
      <TextInput
        style={styles.input}
        value={form.license_number}
        onChangeText={v => handleChange('license_number', v)}
        placeholder="License Number"
      />
      <Text style={styles.label}>Years of Experience</Text>
      <TextInput
        style={styles.input}
        value={form.years_of_experience}
        onChangeText={v => handleChange('years_of_experience', v)}
        placeholder="Years of Experience"
        keyboardType="numeric"
      />
      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={styles.input}
        value={form.bio}
        onChangeText={v => handleChange('bio', v)}
        placeholder="Bio"
        multiline
      />
      <Text style={styles.label}>Languages Spoken (comma separated)</Text>
      <TextInput
        style={styles.input}
        value={form.languages_spoken}
        onChangeText={v => handleChange('languages_spoken', v)}
        placeholder="e.g. English, Spanish"
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

export default TherapistProfileForm;