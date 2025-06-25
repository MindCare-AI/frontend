import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  getMedicalInfo, 
  updateMedicalInfo
} from '../../API/settings/patient_medicalinfo';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

// Types based on backend
interface MedicalHistoryItem {
  id?: number;
  title: string;
  description: string;
  date_occurred: string | null;
}

// Accept any string for metric_type to match backend
type MetricType = string;

interface HealthMetric {
  id?: number;
  metric_type: MetricType;
  value: string;
}

const METRIC_TYPES: MetricType[] = ['Blood Pressure', 'Weight', 'Heart Rate'];

const BLOOD_PRESSURE_OPTIONS = [
  "90/60", "100/70", "110/70", "120/80", "130/85", "140/90", "150/95", "160/100"
];
const WEIGHT_MIN = 30;
const WEIGHT_MAX = 200;
const HEART_RATE_MIN = 40;
const HEART_RATE_MAX = 180;

const PatientMedicalInfoScreen: React.FC = ({ navigation }: any) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditingHistory, setIsEditingHistory] = useState<boolean>(false);
  const [isEditingMetrics, setIsEditingMetrics] = useState<boolean>(false);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryItem[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [hasProfile, setHasProfile] = useState<boolean>(true);

  // Local state for adding new items
  const [showAddHistory, setShowAddHistory] = useState(false);
  const [newHistory, setNewHistory] = useState<MedicalHistoryItem>({
    title: '',
    description: '',
    date_occurred: null,
  });

  const [showAddMetric, setShowAddMetric] = useState(false);
  const [newMetric, setNewMetric] = useState<HealthMetric>({
    metric_type: 'Blood Pressure',
    value: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const data = await getMedicalInfo();
      console.log('[PatientMedicalInfoScreen] getMedicalInfo data:', data);
      setMedicalHistory(Array.isArray(data.medicalHistory) ? data.medicalHistory : []);
      setHealthMetrics(Array.isArray(data.healthMetrics) ? data.healthMetrics : []);
      setHasProfile(true);
    } catch (error: any) {
      if (error.message && error.message.includes('Patient profile not found')) {
        setHasProfile(false);
      } else {
        Alert.alert('Error', 'Unable to load medical information. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMedicalHistory = async () => {
    try {
      setIsSaving(true);
      const historyItem = Array.isArray(medicalHistory) ? medicalHistory[0] : null;
      const payload: any = {
        title: historyItem?.title || 'Medical History',
        description: historyItem?.description || '',
        date_occurred: historyItem?.date_occurred || '',
        emergencyContact: { name: '', relationship: '', phoneNumber: '' }
      };
      console.log('[PatientMedicalInfoScreen] Saving medical history:', payload);
      await updateMedicalInfo(payload);
      setIsEditingHistory(false);
      Alert.alert('Success', 'Medical history updated successfully');
    } catch (error: any) {
      console.log('[PatientMedicalInfoScreen] Error saving medical history:', error);
      Alert.alert('Error', 'Unable to update medical history. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHealthMetrics = async () => {
    try {
      setIsSaving(true);
      const payload: any = {
        healthMetrics: healthMetrics,
        emergencyContact: { name: '', relationship: '', phoneNumber: '' }
      };
      console.log('[PatientMedicalInfoScreen] Saving health metrics:', payload);
      await updateMedicalInfo(payload);
      setIsEditingMetrics(false);
      Alert.alert('Success', 'Health metrics updated successfully');
    } catch (error: any) {
      console.log('[PatientMedicalInfoScreen] Error saving health metrics:', error);
      Alert.alert('Error', 'Unable to update health metrics. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add new medical history
  const addMedicalHistory = () => {
    if (newHistory.title.trim()) {
      setMedicalHistory(prev => [
        ...prev,
        { ...newHistory }
      ]);
      setNewHistory({ title: '', description: '', date_occurred: null });
      setShowAddHistory(false);
    }
  };

  // Remove medical history
  const removeMedicalHistory = (index: number) => {
    setMedicalHistory(prev => prev.filter((_, i) => i !== index));
  };

  // Add new health metric
  const addHealthMetric = () => {
    if (newMetric.value.trim()) {
      setHealthMetrics(prev => [
        ...prev,
        { ...newMetric }
      ]);
      setNewMetric({ metric_type: 'Blood Pressure', value: '' });
      setShowAddMetric(false);
      console.log('[PatientMedicalInfoScreen] Added health metric:', newMetric);
    }
  };

  // Remove health metric
  const removeHealthMetric = (index: number) => {
    setHealthMetrics(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  if (isLoading) {
    return <LoadingSpinner visible={true} />;
  }

  if (!hasProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.profileRequiredContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#002D62" />
          <Text style={styles.profileRequiredTitle}>Profile Setup Required</Text>
          <Text style={styles.profileRequiredText}>
            You need to complete your patient profile before managing your medical information.
          </Text>
          <TouchableOpacity
            style={styles.profileRequiredButton}
            onPress={() => navigation.navigate('PatientProfile')}
          >
            <Text style={styles.profileRequiredButtonText}>Set Up Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoadingSpinner visible={isSaving} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Medical Information</Text>
        </View>

        {/* Medical History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medical History</Text>
            {!isEditingHistory ? (
              <TouchableOpacity onPress={() => setIsEditingHistory(true)}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveMedicalHistory}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={medicalHistory}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.description}</Text>
                  {item.date_occurred && (
                    <Text style={styles.cardDate}>Occurred: {item.date_occurred}</Text>
                  )}
                </View>
                {isEditingHistory && (
                  <TouchableOpacity onPress={() => removeMedicalHistory(index)}>
                    <Ionicons name="close-circle" size={22} color="#FF6B6B" />
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No medical history provided</Text>
            }
          />
          {isEditingHistory && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  fetchAllData();
                  setIsEditingHistory(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveMedicalHistory}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
          {isEditingHistory && (
            <TouchableOpacity onPress={() => setShowAddHistory(true)}>
              <Ionicons name="add-circle" size={28} color="#002D62" />
            </TouchableOpacity>
          )}
        </View>

        {/* Add Medical History Modal */}
        <Modal visible={showAddHistory} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Medical History</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Title"
                value={newHistory.title}
                onChangeText={text => setNewHistory(prev => ({ ...prev, title: text }))}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Description"
                value={newHistory.description}
                onChangeText={text => setNewHistory(prev => ({ ...prev, description: text }))}
                multiline
              />
              {/* Calendar Date Picker */}
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  style={{
                    ...styles.textInput,
                    padding: 10,
                    fontSize: 16,
                    marginBottom: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#DDD',
                  }}
                  value={newHistory.date_occurred || ''}
                  onChange={e =>
                    setNewHistory(prev => ({
                      ...prev,
                      date_occurred: e.target.value,
                    }))
                  }
                  max={new Date().toISOString().split('T')[0]}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={{ color: newHistory.date_occurred ? '#333' : '#888' }}>
                      {newHistory.date_occurred ? `Date: ${newHistory.date_occurred}` : 'Select Date Occurred'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddHistory(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={addMedicalHistory}>
                  <Text style={styles.saveButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Health Metrics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Metrics</Text>
            {!isEditingMetrics ? (
              <TouchableOpacity onPress={() => setIsEditingMetrics(true)}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveHealthMetrics}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={healthMetrics}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.metric_type}</Text>
                  <Text style={styles.cardDesc}>Value: {item.value}</Text>
                </View>
                {isEditingMetrics && (
                  <TouchableOpacity onPress={() => removeHealthMetric(index)}>
                    <Ionicons name="close-circle" size={22} color="#FF6B6B" />
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No health metrics provided</Text>
            }
          />
          {isEditingMetrics && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  fetchAllData();
                  setIsEditingMetrics(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveHealthMetrics}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
          {isEditingMetrics && (
            <TouchableOpacity onPress={() => setShowAddMetric(true)}>
              <Ionicons name="add-circle" size={28} color="#002D62" />
            </TouchableOpacity>
          )}
        </View>

        {/* Add Health Metric Modal */}
        <Modal visible={showAddMetric} transparent animationType="slide" onShow={() => console.log('Health Metric Modal Opened')}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Health Metric</Text>
              <View style={styles.metricTypeRow}>
                {METRIC_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.metricTypeButton,
                      newMetric.metric_type === type && styles.metricTypeButtonActive
                    ]}
                    onPress={() => setNewMetric(prev => ({ ...prev, metric_type: type, value: '' }))}
                  >
                    <Text
                      style={[
                        styles.metricTypeButtonText,
                        newMetric.metric_type === type && styles.metricTypeButtonTextActive
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Value Picker/Slider */}
              {newMetric.metric_type === 'Blood Pressure' && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ marginBottom: 6 }}>Select Value</Text>
                  <View style={{
                    borderWidth: 1,
                    borderColor: '#DDD',
                    borderRadius: 8,
                    backgroundColor: '#F9F9F9'
                  }}>
                    <Picker
                      selectedValue={newMetric.value || BLOOD_PRESSURE_OPTIONS[3]}
                      onValueChange={val => setNewMetric(prev => ({ ...prev, value: val }))}
                    >
                      {BLOOD_PRESSURE_OPTIONS.map(bp => (
                        <Picker.Item key={bp} label={bp} value={bp} />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}
              {newMetric.metric_type === 'Weight' && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ marginBottom: 6 }}>
                    Weight: {newMetric.value || WEIGHT_MIN} kg
                  </Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="range"
                      min={WEIGHT_MIN}
                      max={WEIGHT_MAX}
                      step={1}
                      value={Number(newMetric.value) || WEIGHT_MIN}
                      onChange={e => setNewMetric(prev => ({ ...prev, value: String(e.target.value) }))}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <Slider
                      minimumValue={WEIGHT_MIN}
                      maximumValue={WEIGHT_MAX}
                      step={1}
                      value={Number(newMetric.value) || WEIGHT_MIN}
                      onValueChange={val => setNewMetric(prev => ({ ...prev, value: String(val) }))}
                      minimumTrackTintColor="#002D62"
                      maximumTrackTintColor="#DDD"
                    />
                  )}
                </View>
              )}
              {newMetric.metric_type === 'Heart Rate' && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ marginBottom: 6 }}>
                    Heart Rate: {newMetric.value || HEART_RATE_MIN} bpm
                  </Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="range"
                      min={HEART_RATE_MIN}
                      max={HEART_RATE_MAX}
                      step={1}
                      value={Number(newMetric.value) || HEART_RATE_MIN}
                      onChange={e => setNewMetric(prev => ({ ...prev, value: String(e.target.value) }))}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <Slider
                      minimumValue={HEART_RATE_MIN}
                      maximumValue={HEART_RATE_MAX}
                      step={1}
                      value={Number(newMetric.value) || HEART_RATE_MIN}
                      onValueChange={val => setNewMetric(prev => ({ ...prev, value: String(val) }))}
                      minimumTrackTintColor="#002D62"
                      maximumTrackTintColor="#DDD"
                    />
                  )}
                </View>
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => { setShowAddMetric(false); console.log('Health Metric Modal Closed'); }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={addHealthMetric}>
                  <Text style={styles.saveButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002D62',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4F0F6',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#002D62',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002D62',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 15,
    color: '#444',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F9F9F9',
    minHeight: 44,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    paddingVertical: 10,
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
  profileRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileRequiredTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#002D62',
    marginTop: 20,
    marginBottom: 10,
  },
  profileRequiredText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  profileRequiredButton: {
    backgroundColor: '#002D62',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  profileRequiredButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002D62',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  metricTypeRow: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  metricTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 6,
  },
  metricTypeButtonActive: {
    backgroundColor: '#002D62',
  },
  metricTypeButtonText: {
    color: '#002D62',
    fontWeight: '500',
  },
  metricTypeButtonTextActive: {
    color: '#FFF',
  },
});

export default PatientMedicalInfoScreen;