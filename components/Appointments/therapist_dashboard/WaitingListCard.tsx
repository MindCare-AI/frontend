import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { WaitingListEntryType } from "../../../types/appoint_patient/appointmentTypes";

interface WaitingListCardProps {
  entry: WaitingListEntryType;
  onViewDetails: () => void;
  onAccept: () => void;
  onReject: () => void;
}

const WaitingListCard: React.FC<WaitingListCardProps> = ({
  entry,
  onViewDetails,
  onAccept,
  onReject,
}) => {
  return (
    <Card style={[styles.card, entry.isExpired && styles.expiredCard]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{entry.therapist}</Text>
            <Text style={styles.date}>Requested: {entry.requestedDate}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{entry.status}</Text>
          </View>
        </View>

        <View style={styles.timeSlots}>
          <Text style={styles.timeSlotsLabel}>Preferred Times:</Text>
          <View style={styles.timeSlotsContainer}>
            {entry.preferredTimeSlots.map((slot, index) => (
              <Text key={index} style={styles.timeSlot}>
                {slot}
              </Text>
            ))}
          </View>
        </View>

        {entry.isExpired && (
          <View style={styles.expiredNotice}>
            <Ionicons name="time" size={16} color="#e53e3e" />
            <Text style={styles.expiredText}>Request expired</Text>
          </View>
        )}
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={onViewDetails}>
          <Text style={styles.buttonText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={onAccept}
          disabled={entry.isExpired}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={onReject}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: "#fff",
  },
  expiredCard: {
    opacity: 0.7,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statusContainer: {
    backgroundColor: "#e6f7ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#0072c6",
    fontWeight: "500",
    fontSize: 12,
  },
  timeSlots: {
    marginTop: 8,
  },
  timeSlotsLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeSlot: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 12,
  },
  expiredNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#fff5f5",
    padding: 8,
    borderRadius: 4,
  },
  expiredText: {
    color: "#e53e3e",
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    justifyContent: "flex-end",
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  buttonText: {
    color: "#666",
    fontWeight: "500",
  },
  acceptButton: {
    backgroundColor: "#e6f7ff",
  },
  acceptButtonText: {
    color: "#0072c6",
    fontWeight: "500",
  },
  rejectButton: {
    backgroundColor: "#fff5f5",
  },
  rejectButtonText: {
    color: "#e53e3e",
    fontWeight: "500",
  },
});

export default WaitingListCard;