"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { createAppointment, getAllTherapistProfiles } from "../../../API/Appointment/patient"
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
  const [timeSlots, setTimeSlots] = useState<Array<{ label: string, value: string, time: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [therapistProfiles, setTherapistProfiles] = useState<any[]>([]);
  const { width } = useWindowDimensions()

  // Fetch therapists when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTherapists();
    }
  }, [isOpen]);

  const fetchTherapists = async () => {
    try {
      const response = await getAllTherapistProfiles();
      if (!Array.isArray(response)) {
        setTherapists([]);
        setTherapistProfiles([]);
        return;
      }
      setTherapistProfiles(response);
      setTherapists(
        response.map((therapist: any) => ({
          label: `${therapist.first_name} ${therapist.last_name}`,
          value: therapist.id?.toString() || "",
        }))
      );
    } catch (error) {
      setTherapists([]);
      setTherapistProfiles([]);
    }
  };

  const handleDateChange = (selectedDate: Date | null) => {
    setDate(selectedDate);

    if (!selectedDate || !therapist) {
      setTimeSlots([]);
      setNoSlotsAvailable(false);
      setTimeSlot("");
      return;
    }

    setIsLoading(true);
    setTimeSlots([]);
    setTimeSlot("");

    try {
      const selectedTherapist = therapistProfiles.find((t) => t.id?.toString() === therapist);
      if (!selectedTherapist || !selectedTherapist.availability) {
        setNoSlotsAvailable(true);
        setIsLoading(false);
        return;
      }
      const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const slots = selectedTherapist.availability[dayOfWeek] || [];
      if (!slots.length) {
        setNoSlotsAvailable(true);
        setIsLoading(false);
        return;
      }
      setNoSlotsAvailable(false);
      // Flatten and format slots
      const formattedSlots: Array<{ label: string, value: string, time: string }> = [];
      slots.forEach((slot: any, idx: number) => {
        // Assume slot.start and slot.end are in "HH:mm" format
        const [startHour, startMinute] = slot.start.split(":").map(Number);
        const [endHour, endMinute] = slot.end.split(":").map(Number);
        let current = new Date(selectedDate);
        current.setHours(startHour, startMinute, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(endHour, endMinute, 0, 0);
        while (current < end) {
          const label = current.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
          formattedSlots.push({
            label,
            value: `${idx}-${label}`,
            time: `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`
          });
          current = new Date(current.getTime() + 30 * 60000); // 30 min interval
        }
      });
      setTimeSlots(formattedSlots);
    } catch (error) {
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
      const selectedSlot = timeSlots.find((slot) => slot.value === timeSlot);
      if (!selectedSlot) throw new Error('Invalid time slot selected');

      // Format appointment_date as "YYYY-MM-DD HH:MM"
      const formattedDate = format(date, 'yyyy-MM-dd');
      const appointmentDate = `${formattedDate} ${selectedSlot.time}`; // "YYYY-MM-DD HH:MM"

      await createAppointment({
        therapist: parseInt(therapist),
        appointment_date: appointmentDate,
        duration: '60',
        // notes: "..." // Add notes if you have a notes field in the UI
      });

      onClose();
      // Reset form
      setDate(null);
      setTherapist("");
      setTimeSlot("");
      setNoSlotsAvailable(false);
    } catch (error) {
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
    color: '#444', // Updated to match settings screen text color
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
