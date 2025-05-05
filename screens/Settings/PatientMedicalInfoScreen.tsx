import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getMedicalInfo, updateMedicalInfo } from '../../API/settings/patient_profile';

interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

interface MedicalInfo {
  medicalHistory: string;
  currentMedications: string[];
  allergies: string[];
  emergencyContact: EmergencyContact;
}

const PatientMedicalInfoScreen: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    medicalHistory: '',
    currentMedications: [],
    allergies: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    }
  });

  // Local state for form inputs
  const [newMedication, setNewMedication] = useState<string>('');
  const [newAllergy, setNewAllergy] = useState<string>('');

  useEffect(() => {
    fetchMedicalInfo();
  }, []);

  const fetchMedicalInfo = async () => {
    try {
      setIsLoading(true);
      const data = await getMedicalInfo();
      setMedicalInfo(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching medical info:', error);
      Alert.alert('Error', 'Unable to load medical information. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleSaveMedicalInfo = async () => {
    try {
      setIsSaving(true);
      await updateMedicalInfo(medicalInfo);
      setIsEditing(false);
      setIsSaving(false);
      Alert.alert('Success', 'Medical information updated successfully');
    } catch (error) {
      console.error('Error updating medical info:', error);
      Alert.alert('Error', 'Unable to update medical information. Please try again.');
      setIsSaving(false);
    }
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setMedicalInfo(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setMedicalInfo(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setMedicalInfo(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setMedicalInfo(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002D62" />
        <Text style={styles.loadingText}>Loading medical information...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Medical Information</Text>
          {!isEditing ? (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveMedicalInfo}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical History</Text>
          {isEditing ? (
            <TextInput
              style={styles.textInput}
              multiline
              value={medicalInfo.medicalHistory}
              onChangeText={(text) => 
                setMedicalInfo(prev => ({...prev, medicalHistory: text}))
              }
              placeholder="Enter your medical history"
            />
          ) : (
            <Text style={styles.sectionContent}>
              {medicalInfo.medicalHistory || 'No medical history provided'}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Medications</Text>
          {isEditing && (
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={newMedication}
                onChangeText={setNewMedication}
                placeholder="Add medication"
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addMedication}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.listContainer}>
            {medicalInfo.currentMedications.length > 0 ? 
              medicalInfo.currentMedications.map((medication, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{medication}</Text>
                  {isEditing && (
                    <TouchableOpacity onPress={() => removeMedication(index)}>
                      <Ionicons name="close-circle" size={22} color="#FF6B6B" />
                    </TouchableOpacity>
                  )}
                </View>
              )) :
              <Text style={styles.emptyText}>No medications listed</Text>
            }
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          {isEditing && (
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={newAllergy}
                onChangeText={setNewAllergy}
                placeholder="Add allergy"
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addAllergy}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.listContainer}>
            {medicalInfo.allergies.length > 0 ? 
              medicalInfo.allergies.map((allergy, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{allergy}</Text>
                  {isEditing && (
                    <TouchableOpacity onPress={() => removeAllergy(index)}>
                      <Ionicons name="close-circle" size={22} color="#FF6B6B" />
                    </TouchableOpacity>
                  )}
                </View>
              )) :
              <Text style={styles.emptyText}>No allergies listed</Text>
            }
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          {isEditing ? (
            <View>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={medicalInfo.emergencyContact.name}
                onChangeText={(text) => 
                  setMedicalInfo(prev => ({
                    ...prev, 
                    emergencyContact: {...prev.emergencyContact, name: text}
                  }))
                }
                placeholder="Contact name"
              />
              
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.textInput}
                value={medicalInfo.emergencyContact.relationship}
                onChangeText={(text) => 
                  setMedicalInfo(prev => ({
                    ...prev, 
                    emergencyContact: {...prev.emergencyContact, relationship: text}
                  }))
                }
                placeholder="Relationship"
              />
              
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={medicalInfo.emergencyContact.phoneNumber}
                onChangeText={(text) => 
                  setMedicalInfo(prev => ({
                    ...prev, 
                    emergencyContact: {...prev.emergencyContact, phoneNumber: text}
                  }))
                }
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
            </View>
          ) : (
            <View>
              {medicalInfo.emergencyContact.name ? (
                <>
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Name:</Text>
                    <Text style={styles.contactValue}>{medicalInfo.emergencyContact.name}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Relationship:</Text>
                    <Text style={styles.contactValue}>{medicalInfo.emergencyContact.relationship}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Phone:</Text>
                    <Text style={styles.contactValue}>{medicalInfo.emergencyContact.phoneNumber}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.emptyText}>No emergency contact provided</Text>
              )}
            </View>
          )}
        </View>

        {isEditing && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                fetchMedicalInfo();
                setIsEditing(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveMedicalInfo}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#002D62',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002D62',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E4F0F6',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#002D62',
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#002D62',
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002D62',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F9F9F9',
    minHeight: 50,
    marginBottom: 10,
  },
  listContainer: {
    marginTop: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listItemText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  addItemContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: '#F9F9F9',
  },
  addButton: {
    backgroundColor: '#002D62',
    borderRadius: 8,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  label: {
    fontSize: 15,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 16,
    color: '#666',
    width: 100,
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PatientMedicalInfoScreen;