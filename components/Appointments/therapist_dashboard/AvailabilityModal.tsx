import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, Title, Divider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { TimeSlot, NewTimeSlot } from '../../../types/appoint_therapist/index';
import TimeSlotCard from './TimeSlotCard';

interface AvailabilityModalProps {
  visible: boolean;
  timeSlots: TimeSlot[];
  onDismiss: () => void;
  onAddTimeSlot: (newSlot: NewTimeSlot) => void;
  onRemoveTimeSlot: (id: number) => void;
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeOptions = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
];

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  visible,
  timeSlots,
  onDismiss,
  onAddTimeSlot,
  onRemoveTimeSlot,
}) => {
  const [newSlot, setNewSlot] = useState<NewTimeSlot>({
    day: "Monday",
    startTime: "9:00 AM",
    endTime: "5:00 PM",
  });

  const handleAddTimeSlot = () => {
    onAddTimeSlot(newSlot);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Title style={styles.title}>Manage Availability</Title>
        
        <ScrollView style={styles.scrollView}>
          {timeSlots.map((slot) => (
            <TimeSlotCard
              key={slot.id}
              timeSlot={slot}
              onRemove={onRemoveTimeSlot}
            />
          ))}
        </ScrollView>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Add New Time Slot</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Day</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={newSlot.day}
              onValueChange={(value) => setNewSlot({ ...newSlot, day: value })}
              style={styles.picker}
            >
              {days.map((day) => (
                <Picker.Item key={day} label={day} value={day} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.timeRow}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Start Time</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newSlot.startTime}
                onValueChange={(value) => setNewSlot({ ...newSlot, startTime: value })}
                style={styles.picker}
              >
                {timeOptions.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>End Time</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newSlot.endTime}
                onValueChange={(value) => setNewSlot({ ...newSlot, endTime: value })}
                style={styles.picker}
              >
                {timeOptions.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleAddTimeSlot}
          style={styles.addButton}
          icon="plus"
          buttonColor="#003366"
          textColor="white"
        >
          Add Time Slot
        </Button>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={onDismiss}
            style={styles.button}
            buttonColor="#003366"
            textColor="white"
          >
            Save Availability
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  title: {
    marginBottom: 16,
  },
  scrollView: {
    maxHeight: 200,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 4,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 8,
  },
});

export default AvailabilityModal;