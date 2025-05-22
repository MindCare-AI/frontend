import React, { useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { Modal, Button, DatePicker, Alert } from "./ui"
import { format } from "date-fns"
import { updateAppointmentDate } from "../../../API/Appointment/patient" // You need to implement this API call

type Props = {
  isOpen: boolean
  onClose: () => void
  appointment: any
}

const RescheduleAppointmentModal: React.FC<Props> = ({ isOpen, onClose, appointment }) => {
  const [date, setDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!date) return
    setIsSubmitting(true)
    setError(null)
    try {
      const formattedDate = format(date, 'yyyy-MM-dd')
      // You may need to send time as well, adapt as needed
      await updateAppointmentDate(appointment.id, formattedDate)
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      footer={
        <View style={styles.footerContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Button
            onPress={handleSubmit}
            isDisabled={!date || isSubmitting}
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
        </View>
      }
    >
      <Text style={styles.description}>
        Select a new date for your appointment with {appointment.therapist}.
      </Text>
      <DatePicker
        label="New Date"
        value={date}
        onChange={setDate}
        placeholder="Select a new date"
        minimumDate={new Date()}
        style={styles.datePicker}
      />
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
})

export default RescheduleAppointmentModal