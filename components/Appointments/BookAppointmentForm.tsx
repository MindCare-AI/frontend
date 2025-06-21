import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useBookAppointment } from '../../hooks/Appointments/useBookAppointment';

// Sample booking form component showing how to use the mock data
const BookAppointmentForm: React.FC = () => {
  const {
    loading,
    error,
    availableTherapists,
    availableTimeSlots,
    fetchAvailableTherapists,
    fetchAvailableTimeSlots,
    bookAppointment
  } = useBookAppointment();

  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Fetch therapists when component mounts
  useEffect(() => {
    fetchAvailableTherapists();
  }, [fetchAvailableTherapists]);

  // Fetch time slots when therapist and date are selected
  useEffect(() => {
    if (selectedTherapist && selectedDate) {
      fetchAvailableTimeSlots(selectedTherapist, selectedDate);
    }
  }, [selectedTherapist, selectedDate, fetchAvailableTimeSlots]);

  const handleBookAppointment = async () => {
    if (!selectedTherapist || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select therapist, date, and time');
      return;
    }

    const result = await bookAppointment({
      therapist_id: selectedTherapist,
      date: selectedDate,
      time: selectedTime,
      notes: notes || undefined,
      appointment_type: 'video'
    });

    if (result.success) {
      Alert.alert('Success', result.message || 'Appointment booked successfully!');
      // Reset form
      setSelectedTherapist('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
    } else {
      Alert.alert('Error', result.message || 'Failed to book appointment');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book New Appointment</Text>
      
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {/* Therapist Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Select Therapist:</Text>
        {availableTherapists.map((therapist) => (
          <TouchableOpacity
            key={therapist.id}
            style={[
              styles.option,
              selectedTherapist === therapist.id && styles.selectedOption
            ]}
            onPress={() => setSelectedTherapist(therapist.id)}
          >
            <Text style={styles.therapistName}>{therapist.label}</Text>
            <Text style={styles.therapistSubtitle}>{therapist.subtitle}</Text>
            <Text style={styles.therapistRating}>⭐ {therapist.rating} • {therapist.hourly_rate} TND/hr</Text>
            <Text style={styles.therapistLanguages}>Languages: {therapist.languages.join(', ')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Select Date:</Text>
        <Text style={styles.placeholder}>
          (Date picker would go here - for demo, use: {new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]})
        </Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
        >
          <Text>Select Tomorrow</Text>
        </TouchableOpacity>
      </View>

      {/* Time Selection */}
      {selectedTherapist && selectedDate && (
        <View style={styles.section}>
          <Text style={styles.label}>Available Time Slots:</Text>
          <View style={styles.timeSlots}>
            {availableTimeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.selectedTimeSlot
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.selectedTimeText
                ]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Book Button */}
      <TouchableOpacity
        style={[
          styles.bookButton,
          (!selectedTherapist || !selectedDate || !selectedTime) && styles.disabledButton
        ]}
        onPress={handleBookAppointment}
        disabled={!selectedTherapist || !selectedDate || !selectedTime || loading}
      >
        <Text style={styles.bookButtonText}>
          {loading ? 'Booking...' : 'Book Appointment'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center'
  },
  section: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333'
  },
  option: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9'
  },
  selectedOption: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff'
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  therapistSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  therapistRating: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 2
  },
  therapistLanguages: {
    fontSize: 12,
    color: '#888'
  },
  placeholder: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 10
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center'
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  timeSlot: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectedTimeSlot: {
    backgroundColor: '#007bff',
    borderColor: '#0056b3'
  },
  timeText: {
    color: '#333'
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: '600'
  },
  bookButton: {
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default BookAppointmentForm;
