import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Droplets } from 'lucide-react-native';
import { updatePatientProfile } from '../../utils/onboardingAPI';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface PatientBloodTypeProps {
  onNext: () => void;
  onBack: () => void;
  currentUser?: any;
}

const PatientBloodType: React.FC<PatientBloodTypeProps> = ({ onNext, onBack, currentUser }) => {
  const [selectedBloodType, setSelectedBloodType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (selectedBloodType && currentUser?.profile_id) {
      try {
        setSaving(true);
        await updatePatientProfile(currentUser.profile_id, { blood_type: selectedBloodType });
        console.log('Blood type saved successfully');
      } catch (error) {
        console.error('Error saving blood type:', error);
        Alert.alert('Error', 'Failed to save blood type. You can add it later.');
      } finally {
        setSaving(false);
      }
    }
    onNext();
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Droplets size={60} />
        </View>
        
        <Text style={styles.title}>What's your blood type?</Text>
        <Text style={styles.subtitle}>
          This helps in case of medical emergencies (optional)
        </Text>

        <View style={styles.bloodTypeGrid}>
          {bloodTypes.map((bloodType) => (
            <TouchableOpacity
              key={bloodType}
              style={[
                styles.bloodTypeOption,
                selectedBloodType === bloodType && styles.selectedBloodType
              ]}
              onPress={() => setSelectedBloodType(bloodType)}
            >
              <Text style={[
                styles.bloodTypeText,
                selectedBloodType === bloodType && styles.selectedBloodTypeText
              ]}>
                {bloodType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextButton, saving && styles.disabledButton]} 
            onPress={handleNext}
            disabled={saving}
          >
            <Text style={styles.nextButtonText}>
              {saving ? 'Saving...' : 'Continue'}
            </Text>
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
    flex: 1,
    padding: 30,
    justifyContent: 'center',
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
    marginBottom: 40,
    lineHeight: 22,
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 40,
  },
  bloodTypeOption: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBloodType: {
    backgroundColor: '#002D62',
    borderColor: '#002D62',
  },
  bloodTypeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002D62',
  },
  selectedBloodTypeText: {
    color: '#fff',
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

export default PatientBloodType;
