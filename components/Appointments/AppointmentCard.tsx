"use client"
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from "react-native"
import { Feather } from "@expo/vector-icons"

import Button from "./ui/Button"
import { useTheme } from "../../contexts/ThemeContext"

interface Appointment {
  id: number
  date: string
  time: string
  therapist: string
  type: string
  status: string
  notes: string
}

interface AppointmentCardProps {
  appointment: Appointment
  showJoinButton: boolean
  onPress: () => void
}

export default function AppointmentCard({ appointment, showJoinButton, onPress }: AppointmentCardProps) {
  const { width } = useWindowDimensions()
  const { colors } = useTheme()

  // Responsive layout
  const isWeb = Platform.OS === "web"
  const isSmallScreen = width < 640

  const calculatedWidth = width / 3 - 16; // Example calculation

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

  const dynamicWebCardStyle = {
    width: width / 3 - 16,
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }, isWeb && !isSmallScreen && dynamicWebCardStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.cardHeader, { backgroundColor: colors.background }]}>
        <View>
          <View style={styles.dateTimeRow}>
            <Feather name="calendar" size={14} color={colors.primary} />
            <Text style={[styles.dateTimeText, { color: colors.primary }]}>{appointment.date}</Text>
          </View>
          <View style={styles.dateTimeRow}>
            <Feather name="clock" size={14} color={colors.primary} />
            <Text style={[styles.dateTimeText, { color: colors.primary }]}>{appointment.time}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>{appointment.status}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.therapistName, { color: colors.text }]}>{appointment.therapist}</Text>
        <Text style={[styles.sessionType, { color: colors.secondary }]}>{appointment.type}</Text>
      </View>

      {showJoinButton && appointment.status.toLowerCase() === "confirmed" && (
        <View style={[styles.joinButtonContainer, { borderTopColor: colors.border }]}>
          <Button title="Join Session" icon="video" onPress={() => {}} primary fullWidth />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    width: Platform.OS === "ios" ? 280 : "100%",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  webCard: {
    minWidth: 280,
    maxWidth: 350,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 14,
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    padding: 12,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  sessionType: {
    fontSize: 14,
  },
  joinButtonContainer: {
    borderTopWidth: 1,
    padding: 12,
  },
})
