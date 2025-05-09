"use client"

import type React from "react"
import { useState } from "react"
import { View, Text } from "react-native"
import { format } from "date-fns"
import { useAppointments } from "../../../contexts/AppointmentContext"
import { Modal, Button, DatePicker, Select, Checkbox } from "./ui"

type WaitingListModalProps = {
  isOpen: boolean
  onClose: () => void
}

const WaitingListModal: React.FC<WaitingListModalProps> = ({ isOpen, onClose }) => {
  const [date, setDate] = useState<Date | null>(null)
  const [therapist, setTherapist] = useState("")
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

  const handleSubmit = () => {
    if (therapist && date && (timePreferences.morning || timePreferences.afternoon || timePreferences.evening)) {
      // Prepare preferred time slots array
      const preferredSlots: string[] = []
      if (timePreferences.morning) preferredSlots.push("Morning")
      if (timePreferences.afternoon) preferredSlots.push("Afternoon")
      if (timePreferences.evening) preferredSlots.push("Evening")

      // Get therapist name
      const selectedTherapist = therapists.find((t) => t.value === therapist)?.label || ""

      // Add to waiting list
      addToWaitingList({
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
    }
  }

  const isFormValid = () => {
    return therapist && date && (timePreferences.morning || timePreferences.afternoon || timePreferences.evening)
  }

  const footer = (
    <Button onPress={handleSubmit} isDisabled={!isFormValid()} colorScheme="primary">
      Join Waiting List
    </Button>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Waiting List" footer={footer}>
      <View style={{ gap: 16 }}>
        <Text style={{ marginBottom: 8 }}>Add yourself to the waiting list for the next available appointment.</Text>

        <Select
          label="Preferred Therapist"
          options={therapists}
          value={therapist}
          onValueChange={setTherapist}
          placeholder="Select a therapist"
        />

        <DatePicker
          label="Preferred Date"
          value={date}
          onChange={setDate}
          placeholder="Select a date"
          minimumDate={new Date()}
        />

        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "500", marginBottom: 6 }}>Preferred Time Slots</Text>
          <View style={{ gap: 8 }}>
            <Checkbox
              isChecked={timePreferences.morning}
              onChange={(checked) => setTimePreferences({ ...timePreferences, morning: checked })}
            >
              Morning (9:00 AM - 12:00 PM)
            </Checkbox>

            <Checkbox
              isChecked={timePreferences.afternoon}
              onChange={(checked) => setTimePreferences({ ...timePreferences, afternoon: checked })}
            >
              Afternoon (12:00 PM - 4:00 PM)
            </Checkbox>

            <Checkbox
              isChecked={timePreferences.evening}
              onChange={(checked) => setTimePreferences({ ...timePreferences, evening: checked })}
            >
              Evening (4:00 PM - 7:00 PM)
            </Checkbox>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default WaitingListModal
