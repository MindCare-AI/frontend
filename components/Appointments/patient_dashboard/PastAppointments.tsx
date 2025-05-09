"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Pressable } from "react-native"
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
      <CardHeader>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Past Appointments</Text>
        <Text style={{ color: "#718096" }}>View your appointment history and provide feedback</Text>
      </CardHeader>
      <CardContent>
        <ScrollView height={400}>
          <View style={{ gap: 16 }}>
            {pastAppointments.map((appointment) => (
              <View
                key={appointment.id}
                style={{
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <View>
                    <Text style={{ fontWeight: "500" }}>{appointment.therapist}</Text>
                    <Text style={{ color: "#718096", fontSize: 14 }}>
                      {appointment.date}, {appointment.time}
                    </Text>
                  </View>
                  <Badge colorScheme={getStatusColor(appointment.status)} variant="subtle">
                    {appointment.status}
                  </Badge>
                </View>

                <Pressable
                  onPress={() => toggleExpand(appointment.id)}
                  style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
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
                      marginTop: 8,
                      padding: 12,
                      backgroundColor: "#F7FAFC",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontWeight: "500", fontSize: 14, marginBottom: 4 }}>Notes:</Text>
                    <Text style={{ color: "#4A5568", fontSize: 14 }}>{appointment.notes}</Text>
                  </View>
                )}

                {appointment.status === "Completed" && !appointment.feedbackSubmitted && (
                  <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
                    <Button size="sm" colorScheme="primary" onPress={() => onOpenFeedback(appointment)}>
                      Provide Feedback
                    </Button>
                  </View>
                )}

                {appointment.status === "Completed" && appointment.feedbackSubmitted && (
                  <View
                    style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 8 }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#48BB78" style={{ marginRight: 4 }} />
                    <Text style={{ color: "#48BB78", fontSize: 14 }}>Feedback submitted</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </CardContent>
    </Card>
  )
}

export default PastAppointments
