"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppointments } from "../../../contexts/AppointmentContext"
import type { AppointmentType } from "../../../types/appointmentTypes"
import { Card, CardHeader, CardContent, Badge, Button, ScrollView } from "./ui"

type PastAppointmentsProps = {
  onOpenFeedback: (appointment: AppointmentType) => void
}

const PastAppointments: React.FC<PastAppointmentsProps> = ({ onOpenFeedback }) => {
  const { pastAppointments } = useAppointments()
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "gray"
      case "Cancelled":
        return "error"
      default:
        return "gray"
    }
  }

  const styles = StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 20,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 12,
      elevation: 4,
      marginBottom: 20,
      overflow: 'hidden',
    },
    cardContent: {
      padding: 24,
    },
    feedbackButton: {
      minWidth: 120,
      borderRadius: 999,
      paddingVertical: 12,
      fontWeight: '700',
      fontSize: 16,
    },
    feedbackSubmittedRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#E2E8F0',
      backgroundColor: '#F0FFF4',
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
  })

  if (pastAppointments.length === 0) {
    return (
      <Card style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <CardContent style={{ alignItems: "center" }}>
          <Ionicons name="time-outline" size={64} color="#CBD5E0" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: "500", color: "#4A5568", textAlign: "center" }}>
            No past appointments yet.
          </Text>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card style={{ flex: 1 }}>
      <CardHeader style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#1A202C" }}>Past Appointments</Text>
        <Text style={{ color: "#718096", fontSize: 14, marginTop: 4 }}>
          View your appointment history and provide feedback
        </Text>
      </CardHeader>
      <CardContent style={{ padding: 0 }}>
        <ScrollView style={{ height: 400 }} contentContainerStyle={{ paddingBottom: 120, padding: 24, gap: 28 }}>
          <View style={{ padding: 16, gap: 16 }}>
            {pastAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                style={styles.card}
              >
                <CardContent style={styles.cardContent}>
                  {/* Header Section */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: "600", color: "#2D3748" }}>
                        {appointment.therapist}
                      </Text>
                      <Text style={{ color: "#718096", fontSize: 14, marginTop: 2 }}>
                        {appointment.date}, {appointment.time}
                      </Text>
                    </View>
                    <Badge
                      colorScheme={getStatusColor(appointment.status)}
                      variant="subtle"
                      style={{ marginLeft: 12 }}
                    >
                      {appointment.status}
                    </Badge>
                  </View>

                  {/* Details Section */}
                  <Pressable
                    onPress={() => toggleExpand(appointment.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 8,
                      borderTopWidth: 1,
                      borderTopColor: "#E2E8F0",
                    }}
                  >
                    <Text style={{ color: "#4A90E2", fontWeight: "500", fontSize: 14, marginRight: 4 }}>
                      View Details
                    </Text>
                    <Ionicons
                      name={expandedId === appointment.id ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#4A90E2"
                    />
                  </Pressable>

                  {expandedId === appointment.id && (
                    <View
                      style={{
                        marginTop: 12,
                        padding: 12,
                        backgroundColor: "#F7FAFC",
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontWeight: "600", fontSize: 14, marginBottom: 4, color: "#2D3748" }}>
                        Notes:
                      </Text>
                      <Text style={{ color: "#4A5568", fontSize: 14, lineHeight: 20 }}>{appointment.notes}</Text>
                    </View>
                  )}

                  {/* Feedback Section */}
                  {appointment.status === "Completed" && !appointment.feedbackSubmitted && (
                    <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
                      <Button
                        size="sm"
                        colorScheme="primary"
                        onPress={() => onOpenFeedback(appointment)}
                        style={styles.feedbackButton}
                      >
                        Provide Feedback
                      </Button>
                    </View>
                  )}

                  {appointment.status === "Completed" && appointment.feedbackSubmitted && (
                    <View style={styles.feedbackSubmittedRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#48BB78" style={{ marginRight: 4 }} />
                      <Text style={{ color: "#48BB78", fontSize: 14, fontWeight: "500" }}>Feedback submitted</Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))}
          </View>
        </ScrollView>
      </CardContent>
    </Card>
  )
}

export default PastAppointments
