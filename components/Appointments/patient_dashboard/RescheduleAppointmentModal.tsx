import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { Modal, Button, DatePicker, Select, Alert } from "./ui"
import { format } from "date-fns"
import { updateAppointmentDate, getAllTherapistProfiles } from "../../../API/Appointment/patient"

type Props = {
  isOpen: boolean
  onClose: () => void
  appointment: any
}

const RescheduleAppointmentModal: React.FC<Props> = ({ isOpen, onClose, appointment }) => {
  const [date, setDate] = useState<Date | null>(null)
  const [timeSlot, setTimeSlot] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [therapistProfiles, setTherapistProfiles] = useState<any[]>([])
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null)
  const [timeSlots, setTimeSlots] = useState<Array<{ label: string, value: string, time: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [noSlotsAvailable, setNoSlotsAvailable] = useState(false)

  // Fetch therapist profiles and match therapist on open
  useEffect(() => {
    if (isOpen && appointment) {
      setDate(null)
      setTimeSlot("")
      setNoSlotsAvailable(false)
      setError(null)
      setSuccess(false)
      setTimeSlots([])
      setIsLoading(false)
      fetchTherapists()
    }
    // eslint-disable-next-line
  }, [isOpen, appointment])

  const fetchTherapists = async () => {
    try {
      const profiles = await getAllTherapistProfiles() as any[]
      setTherapistProfiles(profiles)
      // Match therapist by name or id
      let therapistId = appointment.therapist_id || appointment.therapist?.id
      let therapist
      if (therapistId) {
        therapist = (profiles as any[]).find((t: any) => t.id === therapistId)
      } else if (appointment.therapist) {
        // fallback: match by name
        therapist = (profiles as any[]).find((t: any) =>
          `${t.first_name} ${t.last_name}`.trim().toLowerCase() === String(appointment.therapist).trim().toLowerCase()
        )
      }
      setSelectedTherapist(therapist || null)
    } catch (e) {
      setSelectedTherapist(null)
    }
  }

  // When date changes, update available time slots
  useEffect(() => {
    if (!date || !selectedTherapist) {
      setTimeSlots([])
      setNoSlotsAvailable(false)
      setTimeSlot("")
      return
    }
    setIsLoading(true)
    setTimeSlots([])
    setTimeSlot("")
    try {
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
      const slots = selectedTherapist.availability?.[dayOfWeek] || []
      if (!slots.length) {
        setNoSlotsAvailable(true)
        setIsLoading(false)
        return
      }
      setNoSlotsAvailable(false)
      // Flatten and format slots (30 min intervals)
      const formattedSlots: Array<{ label: string, value: string, time: string }> = []
      slots.forEach((slot: any, idx: number) => {
        const [startHour, startMinute] = slot.start.split(":").map(Number)
        const [endHour, endMinute] = slot.end.split(":").map(Number)
        let current = new Date(date)
        current.setHours(startHour, startMinute, 0, 0)
        const end = new Date(date)
        end.setHours(endHour, endMinute, 0, 0)
        while (current < end) {
          const label = current.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
          formattedSlots.push({
            label,
            value: `${idx}-${label}`,
            time: `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`
          })
          current = new Date(current.getTime() + 30 * 60000)
        }
      })
      setTimeSlots(formattedSlots)
    } catch (e) {
      setNoSlotsAvailable(true)
    } finally {
      setIsLoading(false)
    }
  }, [date, selectedTherapist])

  const handleSubmit = async () => {
    if (!date || !timeSlot) return
    setIsSubmitting(true)
    setError(null)
    try {
      const selectedSlot = timeSlots.find((slot) => slot.value === timeSlot)
      if (!selectedSlot) throw new Error('Invalid time slot selected')
      const formattedDate = format(date, 'yyyy-MM-dd')
      await updateAppointmentDate(appointment.id, `${formattedDate}T${selectedSlot.time}:00`)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1000)
    } catch (e) {
      setError("Failed to reschedule. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinWaitingList = () => {
    // You can trigger a parent callback or open the waiting list modal here
    setSuccess(false)
    onClose()
    // Optionally: pass appointment info to waiting list modal
  }

  const footer = (
    <View style={styles.footerContainer}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {date && noSlotsAvailable ? (
        <Button onPress={handleJoinWaitingList} colorScheme="primary">
          Join Waiting List
        </Button>
      ) : (
        <Button
          onPress={handleSubmit}
          isDisabled={!date || (!noSlotsAvailable && !timeSlot) || isSubmitting}
          colorScheme="primary"
        >
          {isSubmitting ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={{ color: "#FFFFFF" }}>Rescheduling...</Text>
            </View>
          ) : (
            "Confirm"
          )}
        </Button>
      )}
    </View>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      footer={footer}
    >
      <Text style={styles.description}>
        Select a new date and time for your appointment with {appointment.therapist}.
      </Text>
      <DatePicker
        label="New Date"
        value={date}
        onChange={setDate}
        placeholder="Select a new date"
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
          icon={undefined}
        >
          No available slots for the selected date. Would you like to join the waiting list?
        </Alert>
      )}
      {success && (
        <Alert status="success" title="Appointment rescheduled!" children={undefined} />
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  description: {
    fontSize: 16,
    marginBottom: 24,
    color: "#444",
  },
  datePicker: {
    width: "100%",
    marginBottom: 16,
  },
  select: {
    width: "100%",
    marginBottom: 16,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  errorText: {
    color: "#E53E3E",
    marginBottom: 12,
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
})

export default RescheduleAppointmentModal