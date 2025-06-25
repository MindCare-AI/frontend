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
import { Stethoscope } from 'lucide-react-native';

interface PatientMedicalInfoProps {
  onNext: (data: any) => void;
  onBack: () => void;
  onSkip?: () => void;
}

interface MedicalInfo {
  currentMedications: string[];
  allergies: string[];
  medicalHistory: string;
}

const PatientMedicalInfo: React.FC<PatientMedicalInfoProps> = ({ onNext, onBack, onSkip }) => {
  const [formData, setFormData] = useState<MedicalInfo>({
    currentMedications: [],
    allergies: [],
    medicalHistory: '',
  });
  const [newMedication, setNewMedication] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setFormData(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, newMedication.trim()],
      }));
      setNewMedication('');
    }
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }));
      setNewAllergy('');
    }
  };

  const handleRemoveMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    // This is where we would normally send data to API
    // In our fake implementation, we just pass the data through
    onNext(formData);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Stethoscope size={60} />
        </View>
        
        <Text style={styles.title}>Medical Information</Text>
        <Text style={styles.subtitle}>
          Help us understand any medical needs you might have (optional)
        </Text>

        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Medical History</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Note any significant medical history..."
              multiline
              numberOfLines={4}
              value={formData.medicalHistory}
              onChangeText={(text) => setFormData(prev => ({ ...prev, medicalHistory: text }))}
            />
          </View>

          <Text style={styles.sectionLabel}>Current Medications</Text>
          <View style={styles.addItemContainer}>
            <TextInput
              style={styles.addItemInput}
              placeholder="Add medication..."
              value={newMedication}
              onChangeText={setNewMedication}
              onSubmitEditing={handleAddMedication}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddMedication}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagContainer}>
            {formData.currentMedications.map((medication, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{medication}</Text>
                <TouchableOpacity onPress={() => handleRemoveMedication(index)}>
                  <Text style={styles.tagRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Allergies</Text>
          <View style={styles.addItemContainer}>
            <TextInput
              style={styles.addItemInput}
              placeholder="Add allergy..."
              value={newAllergy}
              onChangeText={setNewAllergy}
              onSubmitEditing={handleAddAllergy}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddAllergy}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagContainer}>
            {formData.allergies.map((allergy, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{allergy}</Text>
                <TouchableOpacity onPress={() => handleRemoveAllergy(index)}>
                  <Text style={styles.tagRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
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
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002D62',
    marginBottom: 8,
    marginTop: 20,
  },
  textAreaContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    fontSize: 16,
    textAlignVertical: 'top',
    padding: 10,
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
    marginBottom: 15,
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
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PatientMedicalInfo;
