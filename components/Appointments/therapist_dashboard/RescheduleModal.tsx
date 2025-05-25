import React, { useState } from "react";
import { Modal, Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-paper";

// Define the time slots directly in this component instead of importing from AppContext
const availableTimeSlots = [
  { id: "1", time: "09:00 AM" },
  { id: "2", time: "10:00 AM" },
  { id: "3", time: "11:00 AM" },
  { id: "4", time: "01:00 PM" },
  { id: "5", time: "02:00 PM" },
  { id: "6", time: "03:00 PM" },
  { id: "7", time: "04:00 PM" },
];

type TimeSlot = {
  id: string;
  time: string;
};

interface RescheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onReschedule: (date: string, timeSlot: string) => void;
  currentDate?: string;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  visible,
  onClose,
  onReschedule,
  currentDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");

  const handleReschedule = () => {
    if (selectedDate && selectedTimeSlot) {
      onReschedule(selectedDate, selectedTimeSlot);
      onClose();
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleSelectTimeSlot = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reschedule Appointment</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.dateSelectionContainer}>
              <Text style={styles.sectionTitle}>Select a new date:</Text>
              <View style={styles.datesContainer}>
                {["2023-07-25", "2023-07-26", "2023-07-27", "2023-07-28"].map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateButton,
                      selectedDate === date && styles.selectedDateButton,
                    ]}
                    onPress={() => handleSelectDate(date)}
                  >
                    <Text
                      style={[
                        styles.dateButtonText,
                        selectedDate === date && styles.selectedDateButtonText,
                      ]}
                    >
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.timeSelectionContainer}>
              <Text style={styles.sectionTitle}>Select a new time:</Text>
              <View style={styles.timeSlotsContainer}>
                {availableTimeSlots.map((slot: TimeSlot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeButton,
                      selectedTimeSlot === slot.time && styles.selectedTimeButton,
                    ]}
                    onPress={() => handleSelectTimeSlot(slot.time)}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        selectedTimeSlot === slot.time && styles.selectedTimeButtonText,
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonText}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleReschedule}
              disabled={!selectedDate || !selectedTimeSlot}
              style={styles.rescheduleButton}
            >
              Reschedule
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    width: "90%",
    maxWidth: 500,
    borderRadius: 12,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  dateSelectionContainer: {
    marginBottom: 24,
  },
  datesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedDateButton: {
    borderColor: "#4285f4",
    backgroundColor: "#e8f0fe",
  },
  dateButtonText: {
    color: "#666",
  },
  selectedDateButtonText: {
    color: "#4285f4",
    fontWeight: "500",
  },
  timeSelectionContainer: {
    marginBottom: 24,
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTimeButton: {
    borderColor: "#4285f4",
    backgroundColor: "#e8f0fe",
  },
  timeButtonText: {
    color: "#666",
  },
  selectedTimeButtonText: {
    color: "#4285f4",
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelButton: {
    marginRight: 12,
    borderColor: "#ccc",
  },
  cancelButtonText: {
    color: "#666",
  },
  rescheduleButton: {
    backgroundColor: "#4285f4",
  },
});

export default RescheduleModal;