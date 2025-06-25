"use client"

import React, { useState } from "react"
import { StyleSheet, ScrollView, View, Text, ActivityIndicator, Pressable, Modal as RNModal, TouchableOpacity } from "react-native"
import { cancelAppointment } from "../../../API/Appointment/patient"
import { Badge, Button, Card } from "./ui"
import { Ionicons } from "@expo/vector-icons"
import type { AppointmentType } from "../../../types/appoint_patient/appointmentTypes"
import { CardContent, CardFooter, CardHeader } from "../../ui/card"
import { useAppointments } from "../../../contexts/appoint_patient/AppointmentContext"
import RescheduleAppointmentModal from "./RescheduleAppointmentModal"

type UpcomingAppointmentsProps = {
  appointments: AppointmentType[];
  loading: boolean;
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ appointments, loading }) => {
  const { refreshAppointments } = useAppointments();

  const handleCancelAppointment = async (id: number) => {
    try {
      await cancelAppointment(id);
      await refreshAppointments();
    } catch (error) {
      console.error(`Error cancelling appointment ${id}:`, error);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  if (appointments.length === 0) {
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
    <>
      <ScrollView 
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120, // Add extra padding at the bottom for FAB
          backgroundColor: "#FFFFFF",
        }}
        showsVerticalScrollIndicator={true}
      >
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCancel={() => handleCancelAppointment(appointment.id)}
          />
        ))}
      </ScrollView>
    </>
  )
}

type AppointmentCardProps = {
  appointment: AppointmentType
  onCancel: () => void
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onCancel }) => {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

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
    <>
      <Pressable
        onLongPress={() => setActionSheetVisible(true)}
        delayLongPress={400}
        style={({ pressed }) => [
          styles.appointmentCard,
          pressed && styles.appointmentCardPressed
        ]}
      >
        <CardHeader style={styles.cardHeader}>
          <View style={styles.headerTop}>
            <View style={styles.therapistInfo}>
              <Ionicons name="person-circle-outline" size={24} color="#4A5568" style={styles.therapistIcon} />
              <Text style={styles.therapistName}>Therapist: {appointment.therapist}</Text>
            </View>
            <Badge 
              colorScheme={getStatusColor(appointment.status)} 
              variant="subtle"
              size="md"
            >
              {appointment.status}
            </Badge>
          </View>
          <View style={styles.patientInfo}>
            <Ionicons name="people-outline" size={16} color="#4A5568" style={styles.patientIcon} />
            <Text style={styles.patientName}>
              Patient: {appointment.patient || "You"}
            </Text>
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
      </Pressable>
      {/* Action Sheet Modal */}
      <RNModal
        visible={actionSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setActionSheetVisible(false)}
        >
          <View style={styles.actionSheetContainer}>
            <Text style={styles.actionSheetTitle}>Appointment Options</Text>
            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={() => {
                setActionSheetVisible(false);
                onCancel();
              }}
            >
              <Ionicons name="close-circle-outline" size={20} color="#E53E3E" style={{ marginRight: 8 }} />
              <Text style={styles.actionSheetButtonText}>Cancel Appointment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={() => {
                setActionSheetVisible(false);
                setRescheduleOpen(true);
              }}
            >
              <Ionicons name="calendar-outline" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
              <Text style={styles.actionSheetButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionSheetButton, { justifyContent: "center" }]}
              onPress={() => setActionSheetVisible(false)}
            >
              <Text style={[styles.actionSheetButtonText, { color: "#718096" }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </RNModal>
      <RescheduleAppointmentModal
        isOpen={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        appointment={appointment}
      />
    </>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#4A5568",
  },
  emptyStateCard: {
    marginTop: 32,
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
  },
  emptyStateContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    marginTop: 12,
    color: "#A0AEC0",
    textAlign: "center",
  },
  appointmentCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  appointmentCardPressed: {
    backgroundColor: "#F0F4F8",
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  therapistInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  therapistIcon: {
    marginRight: 8,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4a90e2",
  },
  dateTimeContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  dateTimeIcon: {
    marginRight: 4,
  },
  dateTimeText: {
    fontSize: 14,
    color: "#4A5568",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(74, 144, 226, 0.4)",
    justifyContent: "flex-end",
  },
  actionSheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    shadowColor: "#4a90e2",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
  },
  actionSheetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#F7FAFC",
  },
  actionSheetButtonText: {
    fontSize: 16,
    color: "#2D3748",
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 6,
    paddingLeft: 2,
  },
  patientIcon: {
    marginRight: 6,
  },
  patientName: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
  },
});

export default UpcomingAppointments;
