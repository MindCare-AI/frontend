import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { User, Phone } from 'lucide-react-native';
import { updatePatientProfile } from '../../utils/onboardingAPI';

interface PatientPersonalData {
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: 'M' | 'F' | 'O' | 'N';
}

interface PatientPersonalInfoProps {
  onNext: (data: PatientPersonalData) => void;
  onBack: () => void;
  currentUser?: any;
}

const PatientPersonalInfo: React.FC<PatientPersonalInfoProps> = ({ onNext, onBack, currentUser }) => {
  const [formData, setFormData] = useState<PatientPersonalData>({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    phone_number: currentUser?.phone_number || '',
    gender: 'N',
  });

  const handleNext = async () => {
    if (!formData.first_name || !formData.last_name || !formData.phone_number) {
      Alert.alert('Required Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      if (currentUser?.profile_id) {
        console.log('Saving patient personal info:', formData);
        await updatePatientProfile(currentUser.profile_id, formData);
        console.log('Patient personal info saved successfully');
      }
      onNext(formData);
    } catch (error) {
      console.error('Error updating patient profile:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    }
  };

  const updateField = (field: keyof PatientPersonalData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>We need some basic information to get started</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <User size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="First Name *"
              value={formData.first_name}
              onChangeText={(text) => updateField('first_name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <User size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Last Name *"
              value={formData.last_name}
              onChangeText={(text) => updateField('last_name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Phone size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              value={formData.phone_number}
              onChangeText={(text) => updateField('phone_number', text)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>Gender *</Text>
            <View style={styles.genderOptions}>
              {[
                { key: 'M', label: 'Male' },
                { key: 'F', label: 'Female' },
                { key: 'O', label: 'Other' },
                { key: 'N', label: 'Prefer not to say' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.genderOption,
                    formData.gender === option.key && styles.selectedGender
                  ]}
                  onPress={() => updateField('gender', option.key as 'M' | 'F' | 'O' | 'N')}
                >
                  <Text style={[
                    styles.genderText,
                    formData.gender === option.key && styles.selectedGenderText
                  ]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
  },
  content: {
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002D62',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  form: {
    gap: 20,
    marginBottom: 40,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  genderContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  genderLabel: {
    fontSize: 16,
    color: '#002D62',
    fontWeight: '600',
    marginBottom: 12,
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  selectedGender: {
    backgroundColor: '#002D62',
    borderColor: '#002D62',
  },
  genderText: {
    fontSize: 14,
    color: '#666',
  },
  selectedGenderText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#002D62',
  },
  backButtonText: {
    color: '#002D62',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#002D62',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PatientPersonalInfo;
