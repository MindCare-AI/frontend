import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  getTherapistAvailability, 
  updateTherapistAvailability,
  TherapistAvailability,
  TimeSlot,
  DayOfWeek
} from '../../API/settings/therapist_availability';
import { globalStyles } from '../../styles/global';

const days: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const TherapistAvailabilityScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [availability, setAvailability] = useState<TherapistAvailability>({});
  const [videoLink, setVideoLink] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    () => days[0].key
  );

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const data = await getTherapistAvailability();
      setAvailability(data);
      setVideoLink(data.video_session_link || '');

      // pick first day with existing slots, else default to monday
      const firstWithSlots = days.find(d => (data[d.key]?.length || 0) > 0);
      setSelectedDay(firstWithSlots?.key ?? days[0].key);

    } catch (error: any) {
      console.error('Failed to load availability:', error);
      
      // Provide specific error messages based on the error type
      let errorMessage = 'Failed to load your availability schedule. Please try again.';
      let errorTitle = 'Error';
      
      if (error.message.includes('Access denied')) {
        errorTitle = 'Access Denied';
        errorMessage = 'You do not have permission to access availability settings. Please ensure you are logged in as a therapist.';
      } else if (error.message.includes('Authentication failed')) {
        errorTitle = 'Authentication Error';
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.message.includes('therapist profile')) {
        errorTitle = 'Profile Required';
        errorMessage = 'Please complete your therapist profile setup before managing availability.';
      } else if (error.message.includes('Network error')) {
        errorTitle = 'Connection Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      
      const updatedData: TherapistAvailability = {
        ...availability,
        video_session_link: videoLink
      };
      
      await updateTherapistAvailability(updatedData);
      
      Alert.alert(
        'Success',
        'Your availability schedule has been updated.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Failed to save availability:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update your availability. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddTimeSlot = (day: DayOfWeek) => {
    const defaultSlot: TimeSlot = { start: '09:00', end: '17:00' };
    
    setAvailability(prev => {
      const daySlots = [...(prev[day] || [])];
      daySlots.push(defaultSlot);
      
      return {
        ...prev,
        [day]: daySlots
      };
    });
  };

  const handleRemoveTimeSlot = (day: DayOfWeek, index: number) => {
    setAvailability(prev => {
      const daySlots = [...(prev[day] || [])];
      daySlots.splice(index, 1);
      
      return {
        ...prev,
        [day]: daySlots
      };
    });
  };

  const handleTimeChange = (day: DayOfWeek, index: number, field: 'start' | 'end', value: string) => {
    // Format validation (simple version)
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
      return; // Don't update if format is invalid
    }
    
    setAvailability(prev => {
      const daySlots = [...(prev[day] || [])];
      daySlots[index] = {
        ...daySlots[index],
        [field]: value
      };
      
      return {
        ...prev,
        [day]: daySlots
      };
    });
  };

  const renderTimeSlots = (day: DayOfWeek) => {
    const slots = availability[day] || [];
    
    return (
      <View style={styles.timeSlotContainer}>
        {slots.map((slot, index) => (
          <View key={index} style={styles.timeSlot}>
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeLabel}>Start:</Text>
              <TextInput
                style={styles.timeInput}
                value={slot.start}
                onChangeText={(value) => handleTimeChange(day, index, 'start', value)}
                placeholder="HH:MM"
                keyboardType="numbers-and-punctuation"
              />
            </View>
            
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeLabel}>End:</Text>
              <TextInput
                style={styles.timeInput}
                value={slot.end}
                onChangeText={(value) => handleTimeChange(day, index, 'end', value)}
                placeholder="HH:MM"
                keyboardType="numbers-and-punctuation"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveTimeSlot(day, index)}
            >
              <MaterialIcons name="remove-circle" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddTimeSlot(day)}
        >
          <MaterialIcons name="add-circle" size={24} color="#4CAF50" />
          <Text style={styles.addButtonText}>Add Time Slot</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner visible={true} />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingSpinner visible={saving} />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Your Availability</Text>
          <Text style={styles.subtitle}>
            Set your weekly schedule for patient appointments
          </Text>
        </View>

        <View style={styles.videoLinkContainer}>
          <Text style={styles.sectionTitle}>Video Session Link</Text>
          <Text style={styles.sectionInfo}>
            Provide a link that will be shared with patients for video sessions
          </Text>
          <TextInput
            style={styles.linkInput}
            value={videoLink}
            onChangeText={setVideoLink}
            placeholder="Enter your video meeting link (Zoom, Google Meet, etc.)"
          />
        </View>

        <View style={styles.schedulingContainer}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          
          <View style={styles.daysTabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {days.map(day => {
                const slots = availability[day.key] ?? [];
                const hasSlots = slots.length > 0;
                return (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayTab,
                      hasSlots && styles.hasSlots,
                      selectedDay === day.key && styles.selectedDayTab
                    ]}
                    onPress={() => setSelectedDay(day.key)}
                  >
                    <Text
                      style={[
                        styles.dayTabText,
                        hasSlots && styles.hasSlotsText,
                        selectedDay === day.key && styles.selectedDayTabText
                      ]}
                    >
                      {day.label}
                    </Text>
                    {hasSlots && <View style={styles.dayDot} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          
          <View style={styles.dayScheduleContainer}>
            <Text style={styles.dayTitle}>
              {days.find(d => d.key === selectedDay)?.label || ''}
            </Text>
            {renderTimeSlots(selectedDay)}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={saveAvailability}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>Save Availability</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  videoLinkContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  linkInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  schedulingContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: globalStyles.colors.text,
    marginBottom: 8,
  },
  sectionInfo: {
    fontSize: 14,
    color: globalStyles.colors.textSecondary,
    marginBottom: 16,
  },
  daysTabContainer: {
    marginVertical: 16,
  },
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
    position: 'relative'
  },
  hasSlots: {
    backgroundColor: '#E8F5E9'
  },
  hasSlotsText: {
    color: '#388E3C'
  },
  dayDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#388E3C'
  },
  selectedDayTab: {
    backgroundColor: '#4285F4',
  },
  dayTabText: {
    fontSize: 14,
    color: globalStyles.colors.textSecondary,
  },
  selectedDayTabText: {
    color: 'white',
    fontWeight: '600',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  dayScheduleContainer: {
    padding: 8,
  },
  timeSlotContainer: {
    marginBottom: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
  },
  timeInputContainer: {
    flex: 1,
    marginRight: 12,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  saveButton: {
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A0C4FF',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TherapistAvailabilityScreen;