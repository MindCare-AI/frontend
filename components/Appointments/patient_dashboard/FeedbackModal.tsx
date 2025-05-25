"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppointments } from "../../../contexts/appoint_patient/AppointmentContext"
import { submitAppointmentFeedback } from "../../../API/Appointment/patient"
import { Modal, Button, TextArea } from "./ui"

type FeedbackModalProps = {
  isOpen: boolean
  onClose: () => void
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { selectedAppointment } = useAppointments()

  const handleSubmit = async () => {
    if (!selectedAppointment) return
    
    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      await submitAppointmentFeedback(
        selectedAppointment.id,
        { rating, comments: comment }
      )
      
      setSuccess(true)
      
      // Reset form and close modal after a short delay
      setTimeout(() => {
        onClose()
        setRating(0)
        setComment("")
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError("Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setSuccess(false)
    onClose()
  }

  const footer = (
    <View style={{ gap: 12 }}>
      {error && (
        <Text style={{ color: "#E53E3E", textAlign: "center", fontSize: 14 }}>
          {error}
        </Text>
      )}
      {success && (
        <Text style={{ color: "#38A169", textAlign: "center", fontSize: 14 }}>
          Thank you for your feedback!
        </Text>
      )}
      <Button 
        onPress={handleSubmit} 
        isDisabled={rating === 0 || isSubmitting} 
        colorScheme="primary"
      >
        {isSubmitting ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF" }}>Submitting...</Text>
          </View>
        ) : (
          "Submit Feedback"
        )}
      </Button>
    </View>
  )

  if (!selectedAppointment) return null

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Share Your Experience" 
      footer={footer}
    >
      <View style={styles.container}>
        <View style={styles.appointmentInfo}>
          <Text style={styles.therapistName}>
            Appointment with {selectedAppointment?.therapist}
          </Text>
          <Text style={styles.dateText}>
            {selectedAppointment?.date}
          </Text>
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>
            How would you rate your experience?
          </Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable 
                key={star} 
                onPress={() => {
                  setRating(star)
                  setError(null)
                }} 
                style={({ pressed }) => ({
                  padding: 8,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }]
                })}
              >
                <Ionicons
                  name={rating >= star ? "star" : "star-outline"}
                  size={36}
                  color={rating >= star ? "#F6E05E" : "#CBD5E0"}
                />
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating === 0 ? "Select a rating" : 
             rating === 1 ? "Poor" :
             rating === 2 ? "Fair" :
             rating === 3 ? "Good" :
             rating === 4 ? "Very Good" : "Excellent"}
          </Text>
        </View>

        <TextArea
          label="Additional Comments"
          value={comment}
          onChangeText={(text) => {
            setComment(text)
            setError(null)
          }}
          placeholder="Share your thoughts about the appointment..."
          numberOfLines={4}
          style={styles.textArea}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { 
    gap: 24, 
    padding: 16 
  },
  appointmentInfo: { 
    gap: 8 
  },
  therapistName: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#333" 
  },
  dateText: { 
    fontSize: 14, 
    color: "#666" 
  },
  ratingContainer: { 
    gap: 12 
  },
  ratingTitle: { 
    fontSize: 15, 
    fontWeight: "500",
    color: "#333" 
  },
  starsContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    gap: 8,
    paddingVertical: 8 
  },
  ratingText: { 
    textAlign: "center", 
    fontSize: 14, 
    color: "#666",
    marginTop: 4 
  },
  textArea: { 
    minHeight: 100 
  }
})

export default FeedbackModal
