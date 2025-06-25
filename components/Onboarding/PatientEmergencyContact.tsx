import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { Phone, Heart } from 'lucide-react-native';

interface PatientEmergencyContactProps {
  onNext: (data: any) => void;
  onBack: () => void;
  onSkip?: () => void;
}

interface EmergencyContactData {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

const PatientEmergencyContact: React.FC<PatientEmergencyContactProps> = ({ 
  onNext, 
  onBack,
  onSkip
}) => {
  const [formData, setFormData] = useState<EmergencyContactData>({
    name: '',
    relationship: '',
    phoneNumber: '',
    email: ''
  });

  const validateForm = () => {
    return formData.name.trim() !== '' && 
           formData.relationship.trim() !== '' && 
           formData.phoneNumber.trim() !== '';
  };

  const handleNext = () => {
    if (!validateForm()) {
      Alert.alert('Required Fields', 'Please fill in all required fields marked with *');
      return;
    }
    
    // In a real implementation, this would be sent to the server
    // For our fake implementation, just pass to the next screen
    onNext(formData);
  };

  const updateField = (field: keyof EmergencyContactData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Heart size={60} />
        </View>
        
        <Text style={styles.title}>Emergency Contact</Text>
        <Text style={styles.subtitle}>
          Add someone we can contact in case of an emergency
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contact's full name"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relationship *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Parent, Spouse, Friend"
              value={formData.relationship}
              onChangeText={(text) => updateField('relationship', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contact's phone number"
              value={formData.phoneNumber}
              onChangeText={(text) => updateField('phoneNumber', text)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contact's email address"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          {onSkip && (
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.nextButton, !validateForm() && styles.disabledButton]} 
            onPress={handleNext}
            disabled={!validateForm()}
          >
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 30,
    lineHeight: 22,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#002D62',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
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
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  skipButtonText: {
    color: '#666',
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
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PatientEmergencyContact;
