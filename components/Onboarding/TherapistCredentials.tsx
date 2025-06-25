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
import { Award, FileKey } from 'lucide-react-native';

interface TherapistCredentialsProps {
  onNext: (data: any) => void;
  onBack: () => void;
  currentUser?: any;
}

interface CredentialsData {
  licenseNumber: string;
  issuingAuthority: string;
  specializations: string[];
  yearsOfExperience: string;
}

const TherapistCredentials: React.FC<TherapistCredentialsProps> = ({ 
  onNext, 
  onBack,
  currentUser
}) => {
  const [formData, setFormData] = useState<CredentialsData>({
    licenseNumber: '',
    issuingAuthority: '',
    specializations: [],
    yearsOfExperience: '',
  });
  const [newSpecialization, setNewSpecialization] = useState('');

  const validateForm = () => {
    return formData.licenseNumber.trim() !== '' && 
           formData.issuingAuthority.trim() !== '' &&
           formData.yearsOfExperience.trim() !== '';
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim()) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()],
      }));
      setNewSpecialization('');
    }
  };

  const handleRemoveSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
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

  const updateField = (field: keyof CredentialsData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FileKey size={60} />
        </View>
        
        <Text style={styles.title}>Professional Credentials</Text>
        <Text style={styles.subtitle}>
          Tell us about your professional background as a therapist
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>License Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Your license number"
              value={formData.licenseNumber}
              onChangeText={(text) => updateField('licenseNumber', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Issuing Authority *</Text>
            <TextInput
              style={styles.input}
              placeholder="Authority that issued your license"
              value={formData.issuingAuthority}
              onChangeText={(text) => updateField('issuingAuthority', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Years of Experience *</Text>
            <TextInput
              style={styles.input}
              placeholder="Number of years in practice"
              value={formData.yearsOfExperience}
              onChangeText={(text) => updateField('yearsOfExperience', text)}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Specializations</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Add specialization..."
                value={newSpecialization}
                onChangeText={setNewSpecialization}
                onSubmitEditing={handleAddSpecialization}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddSpecialization}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.tagContainer}>
              {formData.specializations.map((specialization, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{specialization}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSpecialization(index)}>
                    <Text style={styles.tagRemove}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextButton, !validateForm() && styles.disabledButton]} 
            onPress={handleNext}
            disabled={!validateForm()}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.homeContainer}>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => {
              Alert.alert(
                "Finish Setup Later?", 
                "You can always complete your profile later. Do you want to go to the login screen?",
                [
                  {
                    text: "Continue Setup", 
                    style: "cancel"
                  },
                  {
                    text: "Go to Login", 
                    onPress: () => {
                      // This would navigate to login screen
                      // In real implementation, we would use navigation.navigate('Auth')
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.homeButtonText}>Finish Later</Text>
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
  addItemContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#002D62',
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
  },
  tagText: {
    fontSize: 14,
    marginRight: 5,
  },
  tagRemove: {
    fontSize: 18,
    color: '#999',
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
  homeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  homeButtonText: {
    color: '#002D62',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default TherapistCredentials;
