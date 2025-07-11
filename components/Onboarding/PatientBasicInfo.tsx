import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
// Removed real API import - using fake data only

interface PatientBasicData {
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: 'M' | 'F' | 'O' | 'N';
}

interface PatientBasicInfoProps {
  onNext: (data: PatientBasicData) => void;
  onBack?: () => void; // Make onBack optional
  currentUser?: any;
}

const PatientBasicInfo: React.FC<PatientBasicInfoProps> = ({ 
  onNext,
  onBack 
}) => {
  // Use appropriate props for Lucide icons
  const primaryColor = "#002D62";
  
  const [formData, setFormData] = useState<PatientBasicData>({
    first_name: '',
    last_name: '',
    phone_number: '',
    gender: 'N',
  });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    return formData.first_name.trim() !== '' && formData.last_name.trim() !== '';
  };

  const handleNext = async () => {
    // Basic validation
    if (!validateForm()) {
      Alert.alert('Required Fields', 'Please fill in your first and last name.');
      return;
    }

    try {
      setLoading(true);
      
      // FAKE - Just simulate a delay instead of real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('FAKE: Patient profile updated with:', formData);
      
      setLoading(false);
      onNext(formData);
    } catch (error) {
      console.error('Error updating patient profile:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
      setLoading(false);
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
            <Ionicons name="person-outline" size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="First Name *"
              value={formData.first_name}
              onChangeText={(text) => updateField('first_name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Last Name *"
              value={formData.last_name}
              onChangeText={(text) => updateField('last_name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="call-outline" size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={formData.phone_number}
              onChangeText={(text) => updateField('phone_number', text)}
              keyboardType="phone-pad"
            />
          </View>

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

        <View style={styles.buttonContainer}>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[
              styles.nextButton, 
              (loading || !validateForm()) && styles.disabledButton
            ]} 
            onPress={handleNext}
            disabled={loading || !validateForm()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>Continue</Text>
            )}
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
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#002D62',
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#002D62',
  },
  disabledButton: {
    backgroundColor: '#9FB1C7',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButtonText: {
    color: '#002D62',
    fontWeight: 'bold',
    fontSize: 16,
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
});

export default PatientBasicInfo;