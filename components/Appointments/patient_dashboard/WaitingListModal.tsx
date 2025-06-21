"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Platform, ScrollView, ActivityIndicator } from "react-native"
import { format } from "date-fns"
import { addToWaitingList, getAllTherapistProfiles } from "../../../API/Appointment/patient" // Updated import
import { Modal, Button, DatePicker, Select, Checkbox } from "./ui"

type WaitingListModalProps = {
  isOpen: boolean
  onClose: () => void
}

const TimeSlotBadge: React.FC<{ timeSlot: string }> = ({ timeSlot }) => {
  const getBadgeColor = (slot: string) => {
    switch (slot) {
      case "Morning":
        return "#F0EAFF" // Light purple matching settings screen
      case "Afternoon":
        return "#E4F0F6" // Light blue matching settings gradient
      case "Evening":
        return "#E8F0EA" // Light green keeping the same style
      default:
        return "#E5E5E5"
    }
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: getBadgeColor(timeSlot) }
      ]}
    >
      <Text style={styles.badgeText}>{timeSlot}</Text>
    </View>
  )
}

const WaitingListModal: React.FC<WaitingListModalProps> = ({ isOpen, onClose }) => {
  const [date, setDate] = useState<Date | null>(null)
  const [therapist, setTherapist] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timePreferences, setTimePreferences] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  })
  const [therapists, setTherapists] = useState<Array<{ label: string, value: string }>>([])
  const [therapistProfiles, setTherapistProfiles] = useState<any[]>([]);

  useEffect(() => {
    fetchTherapists();
  }, []);

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

  const handleSubmit = async () => {
    if (therapist && date && (timePreferences.morning || timePreferences.afternoon || timePreferences.evening)) {
      setIsSubmitting(true)
      setError(null)
      
      try {
        // Prepare preferred time slots array using backend values
        const preferredTimeSlots: string[] = []
        if (timePreferences.morning) preferredTimeSlots.push("morning")
        if (timePreferences.afternoon) preferredTimeSlots.push("afternoon")
        if (timePreferences.evening) preferredTimeSlots.push("evening")

        // Format date
        const formattedDate = format(date, 'yyyy-MM-dd');

        // Add to waiting list using patient API
        await addToWaitingList({
          therapist_id: parseInt(therapist),
          preferred_dates: [formattedDate],
          preferred_time_slots: preferredTimeSlots,
        });

        // Show success message
        console.log("Successfully joined waiting list!");
        
        // Close modal and reset form
        onClose()
        setDate(null)
        setTherapist("")
        setTimePreferences({
          morning: false,
          afternoon: false,
          evening: false,
        })
      } catch (error) {
        console.error("Error adding to waiting list:", error)
        setError("Failed to join waiting list. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const isFormValid = () => {
    return therapist && date && (timePreferences.morning || timePreferences.afternoon || timePreferences.evening)
  }

  const footer = (
    <View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <Button 
        onPress={handleSubmit} 
        isDisabled={!isFormValid() || isSubmitting} 
        colorScheme="primary"
      >
        {isSubmitting ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF" }}>Joining List...</Text>
          </View>
        ) : (
          "Join Waiting List"
        )}
      </Button>
    </View>
  )

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Join Waiting List" 
      footer={footer}
    >
      <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.container}>
        <Text style={styles.description}>
          Add yourself to the waiting list for the next available appointment.
        </Text>

        <View style={styles.formGroup}>
          <Select
            label="Preferred Therapist"
            options={therapists}
            value={therapist}
            onValueChange={setTherapist}
            placeholder="Select a therapist"
          />
        </View>

        <View style={styles.formGroup}>
          <DatePicker
            label="Preferred Date"
            value={date}
            onChange={setDate}
            placeholder="Select a date"
            minimumDate={new Date()}
          />
        </View>

        <View style={styles.timeSlotsContainer}>
          <Text style={styles.timeSlotsLabel}>Preferred Time Slots</Text>
          <View style={styles.checkboxGroup}>
            <Checkbox
              isChecked={timePreferences.morning}
              onChange={(checked) => setTimePreferences({ ...timePreferences, morning: checked })}
            >
              <View style={styles.checkboxContent}>
                <Text>Morning (9:00 AM - 12:00 PM)</Text>
                <TimeSlotBadge timeSlot="Morning" />
              </View>
            </Checkbox>

            <Checkbox
              isChecked={timePreferences.afternoon}
              onChange={(checked) => setTimePreferences({ ...timePreferences, afternoon: checked })}
            >
              <View style={styles.checkboxContent}>
                <Text>Afternoon (12:00 PM - 4:00 PM)</Text>
                <TimeSlotBadge timeSlot="Afternoon" />
              </View>
            </Checkbox>

            <Checkbox
              isChecked={timePreferences.evening}
              onChange={(checked) => setTimePreferences({ ...timePreferences, evening: checked })}
            >
              <View style={styles.checkboxContent}>
                <Text>Evening (4:00 PM - 7:00 PM)</Text>
                <TimeSlotBadge timeSlot="Evening" />
              </View>
            </Checkbox>
          </View>
        </View>
      </ScrollView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    padding: Platform.OS === 'web' ? 24 : 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  timeSlotsContainer: {
    marginBottom: 16,
  },
  timeSlotsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
  },
  checkboxGroup: {
    gap: 12,
  },
  checkboxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  errorText: {
    color: "#E53E3E",
    marginBottom: 12,
    textAlign: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: "#333", // Darker text to match settings screen
  },
})

export default WaitingListModal
