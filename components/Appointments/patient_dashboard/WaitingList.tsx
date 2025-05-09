import type React from "react"
import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppointments } from "../../../contexts/AppointmentContext"
import type { WaitingListEntryType } from "../../../types/appointmentTypes"
import { Card, CardHeader, CardContent, Badge, Button, ScrollView } from "./ui"

const WaitingList: React.FC = () => {
  const { waitingListEntries, cancelWaitingListEntry } = useAppointments()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "warning"
      case "Notified":
        return "purple"
      default:
        return "gray"
    }
  }

  if (waitingListEntries.length === 0) {
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
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Waiting List</Text>
        <Text style={{ color: "#718096" }}>Manage your waiting list entries for preferred appointments</Text>
      </CardHeader>
      <CardContent>
        <ScrollView>
          <View style={{ gap: 16 }}>
            {waitingListEntries.map((entry) => (
              <WaitingListCard key={entry.id} entry={entry} onCancel={() => cancelWaitingListEntry(entry.id)} />
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
      default:
        return "gray"
    }
  }

  return (
    <Card>
      <CardHeader>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>{entry.therapist}</Text>
          <Badge colorScheme={getStatusColor(entry.status)} variant="subtle">
            {entry.status}
          </Badge>
        </View>
        <Text style={{ color: "#718096", marginTop: 4 }}>Requested Date: {entry.requestedDate}</Text>
      </CardHeader>
      <CardContent>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ color: "#718096", marginRight: 8 }}>Preferred times:</Text>
          {entry.preferredTimeSlots.map((slot) => (
            <Badge key={slot} variant="outline" style={{ marginRight: 4, marginBottom: 4 }}>
              {slot}
            </Badge>
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Button variant="outline" colorScheme="primary" size="sm" onPress={onCancel}>
            Cancel Entry
          </Button>
        </View>
      </CardContent>
    </Card>
  )
}

export default WaitingList
