import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { THERAPISTS, TIME_SLOTS } from '../../constants/data';
import TherapistCard from '../../components/TherapistCard';
import AppointmentSlots from '../../components/AppointmentSlots';
import ConfirmationModal from '../../components/ConfirmationSheet';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// Only import DateTimePicker for native platforms
const DateTimePicker = Platform.select({
  native: () => require('@react-native-community/datetimepicker').default,
  default: () => null,
})();

// Add this component for web platform
const WebDatePicker = ({ value, onChange }) => {
  return (
    <input
      type="date"
      value={value ? format(value, 'yyyy-MM-dd') : ''}
      onChange={(e) => {
        const date = new Date(e.target.value);
        onChange({ type: 'set', nativeEvent: { timestamp: date.getTime() } }, date);
      }}
      min={format(new Date(), 'yyyy-MM-dd')}
      style={{
        padding: 15,
        fontSize: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f0f0f0',
        width: '100%',
      }}
    />
  );
};

const BookAppointmentScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateSelect = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setSelectedTime(null);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedTherapist) {
      alert('Please select all appointment details');
      return;
    }
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Appointment booked successfully!');
      setIsConfirmationOpen(false);
      navigation.navigate('AppointmentManagement');
    } catch (error) {
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Select a Therapist</Text>
          {THERAPISTS.map(therapist => (
            <TherapistCard 
              key={therapist.id} 
              therapist={therapist} 
              isSelected={selectedTherapist?.id === therapist.id} 
              onSelect={() => setSelectedTherapist(therapist)}
            />
          ))}
          <TouchableOpacity 
            style={[styles.button, !selectedTherapist && styles.buttonDisabled]}
            disabled={!selectedTherapist} 
            onPress={() => setStep(2)}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setStep(1)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.stepTitle}>Select Date & Time</Text>

          {Platform.OS === 'web' ? (
            <WebDatePicker
              value={selectedDate}
              onChange={handleDateSelect}
            />
          ) : (
            <>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Pick a Date'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker 
                  value={selectedDate || new Date()} 
                  mode="date" 
                  display="default" 
                  onChange={handleDateSelect}
                  minimumDate={new Date()} 
                />
              )}
            </>
          )}

          {selectedDate && (
            <View style={styles.slotsContainer}>
              <Text style={styles.slotsTitle}>Available Slots</Text>
              <AppointmentSlots 
                slots={TIME_SLOTS} 
                selectedSlot={selectedTime} 
                onSelectSlot={setSelectedTime} 
              />
            </View>
          )}

          <TouchableOpacity 
            style={[
              styles.button,
              (!selectedDate || !selectedTime) && styles.buttonDisabled
            ]}
            disabled={!selectedDate || !selectedTime} 
            onPress={() => setIsConfirmationOpen(true)}
          >
            <Text style={styles.buttonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      )}

      <ConfirmationModal 
        isOpen={isConfirmationOpen} 
        onClose={() => setIsConfirmationOpen(false)} 
        therapist={selectedTherapist} 
        date={selectedDate} 
        time={selectedTime} 
        onConfirm={handleBookAppointment} 
        isLoading={isLoading} 
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    padding: 15,
    backgroundColor: '#000',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  dateButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  slotsContainer: {
    marginTop: 20,
  },
  slotsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
});

export default BookAppointmentScreen;
