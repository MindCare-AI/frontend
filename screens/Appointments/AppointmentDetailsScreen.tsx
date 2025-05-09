"use client"
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from "react-native"
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"

import type { AppointmentsStackParamList } from "../../navigation/AppointmentsNavigator"
import Button from "../../components/Appointments/ui/Button"
import Card from "../../components/Appointments/ui/Card"
import { APPOINTMENTS } from "../../data/mockData"
import { useTheme } from "../../contexts/ThemeContext"

type AppointmentDetailsRouteProp = RouteProp<AppointmentsStackParamList, "AppointmentDetails">

export default function AppointmentDetailsScreen() {
  const route = useRoute<AppointmentDetailsRouteProp>()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { appointmentId } = route.params

  // Find the appointment from our mock data
  const appointment = APPOINTMENTS.find((a) => a.id === appointmentId)

  if (!appointment) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.primaryLight} />
          <Text style={[styles.errorText, { color: colors.primary }]}>Appointment not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </SafeAreaView>
    )
  }

  // Check if appointment is within 15 minutes
  const isWithin15Minutes = () => {
    const now = new Date()
    const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`)
    const timeDiff = appointmentDateTime.getTime() - now.getTime()
    const minutesDiff = timeDiff / (1000 * 60)
    return minutesDiff <= 15 && minutesDiff > 0
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return colors.success
      case "pending":
        return colors.warning
      case "cancelled":
        return colors.danger
      default:
        return colors.muted
    }
  }

  const handleCancelAppointment = () => {
    if (Platform.OS === "web") {
      if (
        confirm(
          `Are you sure you want to cancel your appointment with ${appointment.therapist} on ${appointment.date} at ${appointment.time}?`,
        )
      ) {
        alert("Your appointment has been cancelled.")
        navigation.goBack()
      }
    } else {
      Alert.alert(
        "Cancel Appointment",
        `Are you sure you want to cancel your appointment with ${appointment.therapist} on ${appointment.date} at ${appointment.time}?`,
        [
          {
            text: "Keep Appointment",
            style: "cancel",
          },
          {
            text: "Cancel Appointment",
            style: "destructive",
            onPress: () => {
              Alert.alert("Appointment Cancelled", "Your appointment has been cancelled.", [
                { text: "OK", onPress: () => navigation.goBack() },
              ])
            },
          },
        ],
      )
    }
  }

  const handleJoinSession = () => {
    // In a real app, this would launch the video call
    if (Platform.OS === "web") {
      alert("Launching video session...")
    } else {
      Alert.alert("Join Session", "Launching video session...", [{ text: "OK" }])
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Appointment Status Card */}
          <Card>
            <View style={styles.statusHeader}>
              <Text style={[styles.statusTitle, { color: colors.primary }]}>Appointment Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + "20" }]}>
                <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                  {appointment.status}
                </Text>
              </View>
            </View>
          </Card>

          {/* Appointment Details Card */}
          <Card style={styles.detailsCard}>
            <Text style={[styles.detailsTitle, { color: colors.primary }]}>Appointment Details</Text>

            <View style={styles.detailRow}>
              <View style={[styles.detailIconContainer, { backgroundColor: colors.background }]}>
                <Feather name="calendar" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>Date</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{appointment.date}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={[styles.detailIconContainer, { backgroundColor: colors.background }]}>
                <Feather name="clock" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>Time</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{appointment.time}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={[styles.detailIconContainer, { backgroundColor: colors.background }]}>
                <Feather name="user" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>Therapist</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{appointment.therapist}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={[styles.detailIconContainer, { backgroundColor: colors.background }]}>
                <Feather name="tag" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>Session Type</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{appointment.type}</Text>
              </View>
            </View>
          </Card>

          {/* Notes Card */}
          <Card style={styles.notesCard}>
            <Text style={[styles.notesTitle, { color: colors.primary }]}>Session Notes</Text>
            <Text style={[styles.notesContent, { color: colors.text }]}>{appointment.notes}</Text>
          </Card>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {appointment.status.toLowerCase() === "confirmed" && (
          <>
            <Button
              title="Cancel Appointment"
              onPress={handleCancelAppointment}
              variant="outline"
              style={{ flex: 1, marginRight: isWithin15Minutes() ? 8 : 0 }}
            />

            {isWithin15Minutes() && (
              <Button
                title="Join Session"
                icon="video"
                onPress={handleJoinSession}
                primary
                style={{ flex: 1, marginLeft: 8 }}
              />
            )}
          </>
        )}

        {appointment.status.toLowerCase() === "pending" && (
          <Button title="Cancel Appointment" onPress={handleCancelAppointment} variant="outline" fullWidth />
        )}

        {appointment.status.toLowerCase() === "cancelled" && (
          <Button
            title="Schedule New Appointment"
            onPress={() => navigation.navigate("BookAppointment" as never)}
            primary
            fullWidth
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    ...(Platform.OS === "web" && {
      maxWidth: 768,
      marginHorizontal: "auto",
    }),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailsCard: {
    marginTop: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  notesCard: {
    marginTop: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  notesContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 -1px 4px rgba(0, 0, 0, 0.05)",
      },
    }),
  },
})
