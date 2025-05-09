"use client"

import type React from "react"
import { useState } from "react"
import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { useAppointments } from "../../../contexts/AppointmentContext"
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

  const { addAppointment } = useAppointments()

  // Sample data - in a real app, this would come from an API
  const therapists = [
    { label: "Dr. John Doe", value: "1" },
    { label: "Dr. Jane Smith", value: "2" },
    { label: "Dr. Robert Johnson", value: "3" },
  ]

  const timeSlots = [
    { label: "9:00 AM", value: "1" },
    { label: "10:30 AM", value: "2" },
    { label: "1:00 PM", value: "3" },
    { label: "2:30 PM", value: "4" },
    { label: "4:00 PM", value: "5" },
  ]

  const handleDateChange = (selectedDate: Date | null) => {
    setDate(selectedDate)

    // Simulate checking availability - in a real app, this would be an API call
    // For demo purposes, we'll show no slots available if the day is odd
    if (selectedDate && selectedDate.getDate() % 2 === 1) {
      setNoSlotsAvailable(true)
      setTimeSlot("")
    } else {
      setNoSlotsAvailable(false)
    }
  }

  const handleSubmit = () => {
    if (therapist && date && (noSlotsAvailable || timeSlot)) {
      // In a real app, this would submit the appointment request to an API
      if (!noSlotsAvailable) {
        const selectedTherapist = therapists.find((t) => t.value === therapist)?.label || ""
        const selectedTime = timeSlots.find((t) => t.value === timeSlot)?.label || ""

        addAppointment({
          id: Date.now(),
          therapist: selectedTherapist,
          date: format(date, "MMMM d, yyyy"),
          time: selectedTime,
          status: "Scheduled",
          isWithin15Min: false,
        })
      }

      onClose()
      // Reset form
      setDate(null)
      setTherapist("")
      setTimeSlot("")
      setNoSlotsAvailable(false)
    }
  }

  const footer = (
    <>
      {date && noSlotsAvailable ? (
        <Button onPress={onJoinWaitingList} colorScheme="primary">
          Join Waiting List
        </Button>
      ) : (
        <Button
          onPress={handleSubmit}
          isDisabled={!therapist || !date || (!noSlotsAvailable && !timeSlot)}
          colorScheme="primary"
        >
          Book Appointment
        </Button>
      )}
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book New Appointment" footer={footer}>
      <View style={{ gap: 16 }}>
        <Text style={{ marginBottom: 8 }}>Select a therapist, date, and time slot to book your appointment.</Text>

        <Select
          label="Therapist"
          options={therapists}
          value={therapist}
          onValueChange={setTherapist}
          placeholder="Select a therapist"
        />

        <DatePicker
          label="Date"
          value={date}
          onChange={handleDateChange}
          placeholder="Select a date"
          minimumDate={new Date()}
        />

        {date && !noSlotsAvailable && (
          <Select
            label="Time Slot"
            options={timeSlots}
            value={timeSlot}
            onValueChange={setTimeSlot}
            placeholder="Select a time slot"
          />
        )}

        {date && noSlotsAvailable && (
          <Alert
            status="info"
            title="No Available Slots"
            icon={<Ionicons name="time-outline" size={20} color="#3182CE" />}
          >
            No available slots for the selected date. Would you like to join the waiting list?
          </Alert>
        )}
      </View>
    </Modal>
  )
}

export default BookAppointmentModal
