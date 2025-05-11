"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, Platform, ScrollView } from "react-native"
import { format } from "date-fns"
import { useAppointments } from "../../../contexts/AppointmentContext"
import { Modal, Button, DatePicker, Select, Checkbox } from "./ui"

type WaitingListModalProps = {
  isOpen: boolean
  onClose: () => void
}

const TimeSlotBadge: React.FC<{ timeSlot: string }> = ({ timeSlot }) => {
  const getBadgeColor = (slot: string) => {
    switch (slot) {
      case "Morning":
        return "#FFE4B5" // Light orange
      case "Afternoon":
        return "#B5E6FF" // Light blue
      case "Evening":
        return "#E6B5FF" // Light purple
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
  const [timePreferences, setTimePreferences] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  })

  const { addToWaitingList } = useAppointments()

  // Sample data - in a real app, this would come from an API
  const therapists = [
    { label: "Dr. John Doe", value: "1" },
    { label: "Dr. Jane Smith", value: "2" },
    { label: "Dr. Robert Johnson", value: "3" },
  ]

  const handleSubmit = async () => {
    if (therapist && date && (timePreferences.morning || timePreferences.afternoon || timePreferences.evening)) {
      setIsSubmitting(true)
      try {
        // Prepare preferred time slots array
        const preferredSlots: string[] = []
        if (timePreferences.morning) preferredSlots.push("Morning")
        if (timePreferences.afternoon) preferredSlots.push("Afternoon")
        if (timePreferences.evening) preferredSlots.push("Evening")

        // Get therapist name
        const selectedTherapist = therapists.find((t) => t.value === therapist)?.label || ""

        // Add to waiting list
        await addToWaitingList({
          therapist: selectedTherapist,
          requestedDate: format(date, "MMMM d, yyyy"),
          preferredTimeSlots: preferredSlots,
        })

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
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const isFormValid = () => {
    return therapist && date && (timePreferences.morning || timePreferences.afternoon || timePreferences.evening)
  }

  const footer = (
    <Button 
      onPress={handleSubmit} 
      isDisabled={!isFormValid() || isSubmitting} 
      colorScheme="primary"
    >
      {isSubmitting ? "Adding to List..." : "Join Waiting List"}
    </Button>
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
})

export default WaitingListModal
