import type React from "react"
import { View, Text, StyleSheet, Platform } from "react-native"
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
      <Card 
        style={styles.emptyStateCard}
        centered
        elevation={1}
      >
        <CardContent style={styles.emptyStateContent}>
          <Ionicons name="calendar-outline" size={64} color="#CBD5E0" />
          <Text style={styles.emptyStateText}>
            No upcoming appointments. Book one now!
          </Text>
        </CardContent>
      </Card>
    )
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {upcomingAppointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onCancel={() => cancelAppointment(appointment.id)}
        />
      ))}
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
    <Card 
      style={styles.appointmentCard}
      elevation={2}
      animateOnPress
    >
      <CardHeader style={styles.cardHeader}>
        <View style={styles.headerTop}>
          <View style={styles.therapistInfo}>
            <Ionicons name="person-circle-outline" size={24} color="#4A5568" style={styles.therapistIcon} />
            <Text style={styles.therapistName}>{appointment.therapist}</Text>
          </View>
          <Badge 
            colorScheme={getStatusColor(appointment.status)} 
            variant="subtle"
            size="md"
          >
            {appointment.status}
          </Badge>
        </View>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <Ionicons name="calendar-outline" size={16} color="#718096" style={styles.dateTimeIcon} />
            <Text style={styles.dateTimeText}>{appointment.date}</Text>
          </View>
          <View style={styles.dateTimeItem}>
            <Ionicons name="time-outline" size={16} color="#718096" style={styles.dateTimeIcon} />
            <Text style={styles.dateTimeText}>{appointment.time}</Text>
          </View>
        </View>
      </CardHeader>
      <CardFooter style={styles.cardFooter}>
        {appointment.status === "Confirmed" && (
          <Button 
            variant={appointment.isWithin15Min ? "solid" : "outline"} 
            colorScheme="primary" 
            size="sm"
            style={styles.actionButton}
          >
            {appointment.isWithin15Min ? "Join Session" : "Cancel Appointment"}
          </Button>
        )}

        {appointment.status === "Scheduled" && (
          <View style={styles.buttonGroup}>
            <Button 
              variant="outline" 
              colorScheme="primary" 
              size="sm"
              onPress={onCancel}
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button 
              variant="outline" 
              colorScheme="primary" 
              size="sm"
              style={styles.actionButton}
            >
              Reschedule
            </Button>
          </View>
        )}

        {appointment.status === "Pending" && (
          <Button 
            variant="outline" 
            colorScheme="primary" 
            size="sm"
            style={styles.actionButton}
          >
            Reschedule
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 28,
    paddingBottom: 120,
  },
  emptyStateCard: {
    flex: 1,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateContent: {
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "500",
    color: "#4A5568",
    textAlign: "center",
  },
  appointmentCard: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    padding: 0,
  },
  cardHeader: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  therapistInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  therapistIcon: {
    marginRight: 8,
  },
  therapistName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
  },
  dateTimeContainer: {
    flexDirection: "row",
    gap: 16,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeIcon: {
    marginRight: 4,
  },
  dateTimeText: {
    color: "#718096",
    fontSize: 14,
  },
  cardFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#fff',
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    minWidth: 120,
    borderRadius: 999,
    paddingVertical: 12,
    fontWeight: '700',
    fontSize: 16,
  },
})

export default UpcomingAppointments
