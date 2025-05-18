import type React from "react"
import { View, Text, ActivityIndicator, StyleSheet, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppointments } from "../../../contexts/AppointmentContext"
import { removeFromWaitingList } from "../../../API/appointments/waitingList" // Import API
import type { WaitingListEntryType } from "../../../types/appointmentTypes"
import { Card, CardHeader, CardContent, Badge, Button, ScrollView } from "./ui"

type WaitingListProps = {
  entries: WaitingListEntryType[];
  loading: boolean;
}

const WaitingList: React.FC<WaitingListProps> = ({ entries, loading }) => {
  const handleCancelEntry = async (id: number) => {
    try {
      await removeFromWaitingList(id);
      // For now just log success - in a real app you'd update state or trigger a refresh
      console.log(`Waiting list entry ${id} cancelled successfully`);
    } catch (error) {
      console.error(`Error cancelling waiting list entry ${id}:`, error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "warning"
      case "Notified":
        return "purple"
      case "Confirmed":
        return "success"
      case "Cancelled":
        return "error"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return "time-outline"
      case "Notified":
        return "notifications-outline"
      case "Confirmed":
        return "checkmark-circle-outline"
      case "Cancelled":
        return "close-circle-outline"
      default:
        return "help-circle-outline"
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading waiting list...</Text>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <Card style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <CardContent style={{ alignItems: "center" }}>
          <Ionicons name="time-outline" size={64} color="#CBD5E0" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: "500", color: "#4A5568", textAlign: "center" }}>
            You don't have any waiting list entries.
          </Text>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card style={{ flex: 1 }}>
      <CardHeader>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="list-outline" size={24} color="#4A5568" />
          <Text style={{ fontSize: 20, fontWeight: "600" }}>Waiting List</Text>
        </View>
        <Text style={{ color: "#718096", marginTop: 4 }}>Manage your waiting list entries for preferred appointments</Text>
      </CardHeader>
      <CardContent>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            padding: 16, 
            paddingBottom: 150 // Increased padding
          }}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          <View style={{ gap: 16 }}>
            {entries.map((entry) => (
              <WaitingListCard 
                key={entry.id} 
                entry={entry} 
                onCancel={() => handleCancelEntry(entry.id)} 
              />
            ))}
          </View>
        </ScrollView>
      </CardContent>
    </Card>
  )
}

type WaitingListCardProps = {
  entry: WaitingListEntryType
  onCancel: () => void
}

const WaitingListCard: React.FC<WaitingListCardProps> = ({ entry, onCancel }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "warning"
      case "Notified":
        return "purple"
      case "Confirmed":
        return "success"
      case "Cancelled":
        return "error"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return "time-outline"
      case "Notified":
        return "notifications-outline"
      case "Confirmed":
        return "checkmark-circle-outline"
      case "Cancelled":
        return "close-circle-outline"
      default:
        return "help-circle-outline"
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
      padding: 0,
    },
    cardContent: {
      padding: 24,
    },
    statusBadge: {
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
      fontWeight: '700',
      fontSize: 15,
      marginLeft: 8,
    },
    timeSlotBadge: {
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      fontWeight: '600',
      fontSize: 14,
      marginLeft: 6,
      backgroundColor: '#F3F4F6',
    },
    actionButton: {
      minWidth: 120,
      borderRadius: 999,
      paddingVertical: 12,
      fontWeight: '700',
      fontSize: 16,
      marginTop: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#4A5568',
    },
  })

  return (
    <Card style={styles.card}>
      <CardHeader>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="person-outline" size={20} color="#4A5568" />
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{entry.therapist}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name={getStatusIcon(entry.status)} size={16} color="#4A5568" />
            <Badge colorScheme={getStatusColor(entry.status)} variant="subtle" style={styles.statusBadge}>
              {entry.status}
            </Badge>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
          <Ionicons name="calendar-outline" size={16} color="#718096" />
          <Text style={{ color: "#718096" }}>Requested Date: {entry.requestedDate}</Text>
        </View>
      </CardHeader>
      <CardContent style={styles.cardContent}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Text style={{ color: "#718096" }}>Preferred times:</Text>
          {entry.preferredTimeSlots.map((slot) => (
            <Badge 
              key={slot} 
              variant="outline" 
              style={styles.timeSlotBadge}
            >
              {slot}
            </Badge>
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Button 
            variant="outline" 
            colorScheme="primary" 
            size="sm" 
            onPress={onCancel}
            style={styles.actionButton}
          >
            <Ionicons name="close-circle-outline" size={16} color="#4A5568" />
            Cancel Entry
          </Button>
        </View>
      </CardContent>
    </Card>
  )
}

export default WaitingList
