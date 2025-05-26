import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Calendar, User, Phone, Mail } from 'lucide-react-native';
import { updatePatientProfile } from '../../utils/onboardingAPI';

interface PatientBasicData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
}

interface PatientBasicInfoProps {
  onNext: (data: PatientBasicData) => void;
  onBack: () => void;
  currentUser?: any;
}

const PatientBasicInfo: React.FC<PatientBasicInfoProps> = ({ 
  onNext, 
  onBack, 
  currentUser 
}) => {
  const [formData, setFormData] = useState<PatientBasicData>({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    email: currentUser?.email || '',
    phone_number: currentUser?.phone_number || '',
    date_of_birth: '',
  });

  const handleNext = async () => {
    // Basic validation
    if (!formData.first_name || !formData.last_name) {
      Alert.alert('Required Fields', 'Please fill in your first and last name.');
      return;
    }

    try {
      if (currentUser?.profile_id) {
        console.log('Saving patient data:', formData);
        await updatePatientProfile(currentUser.profile_id, formData);
        console.log('Patient data saved successfully');
      }
      onNext(formData);
    } catch (error) {
      console.error('Error updating patient profile:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    }
  };

  const updateField = (field: keyof PatientBasicData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>Help us personalize your experience</Text>

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
            <Mail size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Phone size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={formData.phone_number}
              onChangeText={(text) => updateField('phone_number', text)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Calendar size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (YYYY-MM-DD)"
              value={formData.date_of_birth}
              onChangeText={(text) => updateField('date_of_birth', text)}
            />
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
  scrollView: {
    flex: 1,
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

export default PatientBasicInfo;
