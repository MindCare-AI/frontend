"use client"

import type React from "react"
import { useState, useEffect } from "react" // Added useEffect
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { createAppointment } from "../../../API/appointments/appointments" // Import API
import { getTherapistAvailability } from "../../../API/appointments/patient" // Import API
import { Modal, Button, DatePicker, Select, Alert } from "./ui"

type BookAppointmentModalProps = {
  isOpen: boolean
  onClose: () => void
  onJoinWaitingList: () => void
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ isOpen, onClose, onJoinWaitingList }) => {
  const [date, setDate] = useState<Date | null>(null)
  const [therapist, setTherapist] = useState("")
  const [timeSlot, setTimeSlot] = useState("")
  const [noSlotsAvailable, setNoSlotsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [therapists, setTherapists] = useState<Array<{ label: string, value: string }>>([])
  const [timeSlots, setTimeSlots] = useState<Array<{ label: string, value: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { width } = useWindowDimensions()

  // Fetch therapists when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTherapists();
    }
  }, [isOpen]);

  const fetchTherapists = async () => {
    // You would need to implement this API call or use a mock
    // For now let's use your sample data
    setTherapists([
      { label: "Dr. John Doe", value: "1" },
      { label: "Dr. Jane Smith", value: "2" },
      { label: "Dr. Robert Johnson", value: "3" },
    ]);
  };

  const handleDateChange = async (selectedDate: Date | null) => {
    setDate(selectedDate)
    
    if (!selectedDate || !therapist) {
      return;
    }

    setIsLoading(true);
    setTimeSlots([]);
    setTimeSlot("");

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const response = await getTherapistAvailability(parseInt(therapist), formattedDate);
      
      if (response.available_slots.length === 0) {
        setNoSlotsAvailable(true);
      } else {
        setNoSlotsAvailable(false);
        
        // Format time slots for the dropdown
        const formattedSlots = response.available_slots.map((slot, index) => {
          const startTime = new Date(`${formattedDate}T${slot.start}`);
          return {
            label: startTime.toLocaleTimeString('en-US', {
              hour: 'numeric', minute: 'numeric', hour12: true
            }),
            value: String(index)
          };
        });
        
        setTimeSlots(formattedSlots);
      }
    } catch (error) {
      console.error('Error fetching therapist availability:', error);
      setError('Failed to fetch available time slots');
      setNoSlotsAvailable(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!therapist || !date || !timeSlot) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const selectedSlot = timeSlots[parseInt(timeSlot)];
      if (!selectedSlot) throw new Error('Invalid time slot selected');
      
      const formattedDate = format(date, 'yyyy-MM-dd');
      const selectedTime = selectedSlot.label;
      
      // Format time for API: Convert "3:30 PM" to "15:30" format
      const timeParts = selectedTime.match(/(\d+):(\d+) ([AP]M)/);
      if (!timeParts) throw new Error('Invalid time format');
      
      let hours = parseInt(timeParts[1]);
      if (timeParts[3] === 'PM' && hours !== 12) hours += 12;
      if (timeParts[3] === 'AM' && hours === 12) hours = 0;
      
      const minutes = timeParts[2];
      const isoTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
      
      await createAppointment({
        therapist_id: parseInt(therapist),
        appointment_date: `${formattedDate}T${isoTime}:00`,
        duration_minutes: 60
      });
      
      onClose();
      // Reset form
      setDate(null);
      setTherapist("");
      setTimeSlot("");
      setNoSlotsAvailable(false);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <View style={styles.footerContainer}>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      {date && noSlotsAvailable ? (
        <Button 
          onPress={onJoinWaitingList} 
          colorScheme="primary"
        >
          Join Waiting List
        </Button>
      ) : (
        <Button
          onPress={handleSubmit}
          isDisabled={!therapist || !date || (!noSlotsAvailable && !timeSlot) || isSubmitting}
          colorScheme="primary"
        >
          {isSubmitting ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={{ color: "#FFFFFF" }}>Booking...</Text>
            </View>
          ) : (
            "Book Appointment"
          )}
        </Button>
      )}
    </View>
  )

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Book New Appointment" 
      footer={footer}
    >
      <ScrollView style={{ width: '100%' }} contentContainerStyle={[styles.container, { maxWidth: width > 600 ? 500 : '100%' }]}> 
        <Text style={styles.description}>
          Select a therapist, date, and time slot to book your appointment.
        </Text>

        <View style={styles.formContainer}>
          <Select
            label="Therapist"
            options={therapists}
            value={therapist}
            onValueChange={(value) => {
              setTherapist(value);
              if (date) {
                handleDateChange(date);
              }
            }}
            placeholder="Select a therapist"
            style={styles.select}
          />

          <DatePicker
            label="Date"
            value={date}
            onChange={handleDateChange}
            placeholder="Select a date"
            minimumDate={new Date()}
            style={styles.datePicker}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text style={{ marginLeft: 8 }}>Checking availability...</Text>
            </View>
          )}

          {date && !noSlotsAvailable && !isLoading && (
            <Select
              label="Time Slot"
              options={timeSlots}
              value={timeSlot}
              onValueChange={setTimeSlot}
              placeholder="Select a time slot"
              style={styles.select}
            />
          )}

          {date && noSlotsAvailable && !isLoading && (
            <Alert
              status="info"
              title="No Available Slots"
              icon={<Ionicons name="time-outline" size={20} color="#3182CE" />}
            >
              No available slots for the selected date. Would you like to join the waiting list?
            </Alert>
          )}
        </View>
      </ScrollView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5568',
    marginBottom: 24,
  },
  formContainer: {
    gap: 20,
  },
  select: {
    width: '100%',
  },
  datePicker: {
    width: '100%',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  errorText: {
    color: "#E53E3E",
    marginBottom: 12,
    textAlign: "center",
  },
})

export default BookAppointmentModal
