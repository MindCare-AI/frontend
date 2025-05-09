import type React from "react"
import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppointments } from "../../../contexts/AppointmentContext"
import type { AppointmentType } from "../../../types/appointmentTypes"
import { Card, CardHeader, CardContent, CardFooter, Badge, Button, ScrollView } from "./ui"

const UpcomingAppointments: React.FC = () => {
  const { upcomingAppointments, cancelAppointment } = useAppointments()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "success"
      case "Pending":
        return "warning"
      case "Scheduled":
        return "info"
      case "Cancelled":
        return "error"
      default:
        return "gray"
    }
  }

  if (upcomingAppointments.length === 0) {
    return (
      <Card style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <CardContent style={{ alignItems: "center" }}>
          <Ionicons name="calendar-outline" size={64} color="#CBD5E0" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: "500", color: "#4A5568", textAlign: "center" }}>
            No upcoming appointments. Book one now!
          </Text>
        </CardContent>
      </Card>
    )
  }

  return (
    <ScrollView>
      <View style={{ flexDirection: "column", gap: 16 }}>
        {upcomingAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCancel={() => cancelAppointment(appointment.id)}
          />
        ))}
      </View>
    </ScrollView>
  )
}

type AppointmentCardProps = {
  appointment: AppointmentType
  onCancel: () => void
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onCancel }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "success"
      case "Pending":
        return "warning"
      case "Scheduled":
        return "info"
      case "Cancelled":
        return "error"
      default:
        return "gray"
    }
  }

  return (
    <Card>
      <CardHeader>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>{appointment.therapist}</Text>
          <Badge colorScheme={getStatusColor(appointment.status)} variant="subtle">
            {appointment.status}
          </Badge>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <Ionicons name="calendar-outline" size={16} color="#718096" style={{ marginRight: 4 }} />
          <Text style={{ color: "#718096" }}>
            {appointment.date}, {appointment.time}
          </Text>
        </View>
      </CardHeader>
      <CardFooter style={{ justifyContent: "flex-end", gap: 8 }}>
        {appointment.status === "Confirmed" && (
          <Button variant={appointment.isWithin15Min ? "solid" : "outline"} colorScheme="primary" size="sm">
            {appointment.isWithin15Min ? "Join Session" : "Cancel Appointment"}
          </Button>
        )}

        {appointment.status === "Scheduled" && (
          <>
            <Button variant="outline" colorScheme="primary" size="sm" onPress={onCancel}>
              Cancel
            </Button>
            <Button variant="outline" colorScheme="primary" size="sm">
              Reschedule
            </Button>
          </>
        )}

        {appointment.status === "Pending" && (
          <Button variant="outline" colorScheme="primary" size="sm">
            Reschedule
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default UpcomingAppointments
