"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppointments } from "../../../contexts/AppointmentContext"
import { Modal, Button, TextArea } from "./ui"

type FeedbackModalProps = {
  isOpen: boolean
  onClose: () => void
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")

  const { selectedAppointment, submitFeedback } = useAppointments()

  const handleSubmit = () => {
    if (selectedAppointment && rating > 0) {
      // Submit feedback
      submitFeedback(selectedAppointment.id, rating, comment)

      // Close modal and reset form
      onClose()
      setRating(0)
      setComment("")
    }
  }

  const footer = (
    <Button onPress={handleSubmit} isDisabled={rating === 0} colorScheme="primary">
      Submit Feedback
    </Button>
  )

  if (!selectedAppointment) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Provide Feedback" footer={footer}>
      <View style={{ gap: 16 }}>
        <Text>
          Share your experience with {selectedAppointment.therapist} on {selectedAppointment.date}.
        </Text>

        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "500", marginBottom: 6 }}>Rating</Text>
          <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)} style={{ padding: 4 }}>
                <Ionicons
                  name={rating >= star ? "star" : "star-outline"}
                  size={32}
                  color={rating >= star ? "#F6E05E" : "#CBD5E0"}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <TextArea
          label="Comments"
          value={comment}
          onChangeText={setComment}
          placeholder="Share your thoughts about the appointment..."
          numberOfLines={4}
        />
      </View>
    </Modal>
  )
}

export default FeedbackModal
